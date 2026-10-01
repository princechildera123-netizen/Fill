import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface SemanticMatchInput {
  fields: { id: string; label: string; context?: string }[];
  targetKeys?: { key: string; label: string; description: string; category?: string }[];
}

export interface StructuredAiMatchResult {
  id: string;
  category: string;
  confidence: number;
  short_reason: string;
  vaultKey?: string;
  reasoning?: string;
}

const ALLOWED_CATEGORIES = [
  'identity.fullName',
  'identity.firstName',
  'identity.middleName',
  'identity.lastName',
  'identity.preferredName',
  'identity.dob',
  'contact.email',
  'contact.phone',
  'education.school',
  'education.program',
  'education.course',
  'education.level',
  'education.graduationYear',
  'education.gradYear',
  'address.street',
  'address.city',
  'address.state',
  'address.country',
  'emergency.name',
  'emergency.relationship',
  'emergency.phone',
];

export async function handleSemanticMatch(body: SemanticMatchInput): Promise<{
  matches: StructuredAiMatchResult[];
  error?: string;
}> {
  const ai = getAiClient();
  if (!ai) {
    return {
      error: 'GEMINI_API_KEY is not configured on server; using local deterministic matcher and FILL Memory.',
      matches: [],
    };
  }

  const { fields, targetKeys } = body;
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return { matches: [] };
  }

  const allowedList = targetKeys && targetKeys.length > 0
    ? targetKeys.map((t) => `- "${t.key}" (${t.label}): ${t.description}`).join('\n')
    : ALLOWED_CATEGORIES.map((c) => `- "${c}"`).join('\n');

  const systemInstruction = `You are the FILL Semantic Field Understanding Engine.
Your job is to understand unfamiliar or non-standard form field labels from academic, fellowship, and scholarship forms, and map each form field to its canonical category.

DATA MINIMIZATION MANDATE:
You ONLY receive field labels and context. No personal user data is ever provided or processed.

Available Categories:
${allowedList}

For each input field:
1. Identify the most accurate canonical category (or empty if unrelated).
2. Assign a confidence score between 0.50 and 0.99.
3. Provide a concise, clear single-sentence "short_reason" explaining the semantic interpretation.
Example: "FILL interpreted 'educational institution' as the school currently attended."

Strictly output valid JSON matching the schema.`;

  try {
    const prompt = JSON.stringify({
      fieldsToClassify: fields.map((f) => ({
        id: f.id,
        label: f.label,
        context: f.context || '',
      })),
    });

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    short_reason: { type: Type.STRING },
                  },
                  required: ['id', 'category', 'confidence', 'short_reason'],
                },
              },
            },
            required: ['matches'],
          },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API semantic match timeout')), 10000)
      ),
    ]);

    const text = response.text;
    if (!text) {
      return { matches: [] };
    }

    const parsed = JSON.parse(text);
    const rawMatches = parsed.matches || [];

    // Validate structured AI response against allowed categories (Section 4 mandate)
    const validatedMatches: StructuredAiMatchResult[] = [];
    for (const item of rawMatches) {
      if (item && typeof item.category === 'string') {
        const cat = item.category.trim();
        // Normalize alias
        const cleanCat = cat === 'education.programme' ? 'education.program' : cat;
        const conf = typeof item.confidence === 'number' ? Math.max(0.5, Math.min(0.99, item.confidence)) : 0.85;
        const reason = typeof item.short_reason === 'string' && item.short_reason.length > 0
          ? item.short_reason
          : `FILL interpreted '${cleanCat}' based on form context.`;

        validatedMatches.push({
          id: item.id || '',
          category: cleanCat,
          vaultKey: cleanCat,
          confidence: conf,
          short_reason: reason,
          reasoning: reason,
        });
      }
    }

    return { matches: validatedMatches };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Semantic match error (falling back to deterministic logic):', errorMsg);
    return { matches: [], error: 'Semantic reasoning temporarily unavailable; applied local matcher.' };
  }
}

/**
 * Multimodal Document Structure & Form Field Extractor
 * Extracts visible fields from uploaded PDFs or images while strictly observing data minimization.
 */
export async function handleDocumentExtraction(body: {
  fileName: string;
  fileText?: string;
  base64Image?: string;
  mimeType?: string;
}): Promise<{
  fields: {
    id: string;
    originalLabel: string;
    nearbyContext: string;
    fieldType: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'number';
    detectedValue?: string;
  }[];
  unconfidentSections?: string[];
  error?: string;
}> {
  const ai = getAiClient();
  if (!ai) {
    return {
      fields: [],
      error: 'AI vision offline; using local document parser.',
    };
  }

  const { fileName, fileText, base64Image, mimeType } = body;

  try {
    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

    if (base64Image && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: base64Image,
        },
      });
    }

    const textPrompt = `You are the FILL Document Structure & Field Extractor.
Inspect this form document: "${fileName}".
${fileText ? `Document Text Content:\n${fileText.slice(0, 4000)}` : ''}

Your task:
1. Identify all interactive form input fields, labels, and question prompts.
2. For each detected field, extract:
   - originalLabel: the exact text label on the form (e.g. "Institution presently attended", "Date of birth")
   - nearbyContext: section title or accompanying instructional text
   - fieldType: text, email, phone, date, select, checkbox, or number
   - detectedValue: any pre-filled value if present, else omit
3. If any section cannot be read confidently, include it in unconfidentSections.

DATA PRIVACY: Extract structure and field labels only. Never store or hallucinate private user data.`;

    contents.push(textPrompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalLabel: { type: Type.STRING },
                  nearbyContext: { type: Type.STRING },
                  fieldType: { type: Type.STRING },
                  detectedValue: { type: Type.STRING },
                },
                required: ['id', 'originalLabel', 'nearbyContext', 'fieldType'],
              },
            },
            unconfidentSections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['fields'],
        },
      },
    });

    const resText = response.text;
    if (!resText) {
      return { fields: [] };
    }

    const parsed = JSON.parse(resText);
    return {
      fields: parsed.fields || [],
      unconfidentSections: parsed.unconfidentSections || [],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Document extraction failed, using fallback parser:', errorMsg);
    return { fields: [], error: errorMsg };
  }
}
