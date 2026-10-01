/**
 * Client-Side Semantic AI Service
 * Proxies minimal field label queries to the secure server-side Gemini API
 * Strictly enforces Section 14 data minimization and Section 13 failure handling.
 */

import { SemanticMatchResponseItem } from '../types/fill';
import { VAULT_FIELD_DEFINITIONS } from './vaultSchema';

export interface SemanticClassificationResult {
  category: string;
  confidence: number;
  short_reason: string;
}

/**
 * Sends ONLY field labels and minimal context to the server.
 * Never sends Vault contents or user personal data.
 */
export async function querySemanticAi(
  fields: { id: string; label: string; context?: string }[]
): Promise<{
  results: Map<string, SemanticClassificationResult>;
  error?: string;
}> {
  const results = new Map<string, SemanticClassificationResult>();
  if (!fields || fields.length === 0) {
    return { results };
  }

  const targetKeys = VAULT_FIELD_DEFINITIONS.map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    category: def.category,
  }));

  const payload = {
    fields: fields.map((f) => ({
      id: f.id,
      label: f.label,
      context: f.context || '',
    })),
    targetKeys,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/semantic-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Semantic AI API returned status ${res.status}`);
      return {
        results,
        error: 'Semantic service unavailable; used deterministic matching.',
      };
    }

    const data = await res.json();
    if (data.matches && Array.isArray(data.matches)) {
      for (const item of data.matches as SemanticMatchResponseItem[]) {
        const cat = item.category || item.matchedVaultKey;
        if (item.id && cat) {
          const reason =
            item.short_reason ||
            item.reasoning ||
            `FILL interpreted '${item.label || cat}' using semantic AI.`;

          results.set(item.id, {
            category: cat,
            confidence: item.confidence || 0.85,
            short_reason: reason,
          });
        }
      }
    }

    return { results, error: data.error };
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const friendlyMessage = isAbort
      ? 'Semantic reasoning timed out; using deterministic matcher.'
      : 'Semantic connection unavailable; local matcher applied.';

    console.warn(friendlyMessage, err);
    return { results, error: friendlyMessage };
  }
}
