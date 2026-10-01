/**
 * Canonical Field Definitions & Semantic Normalization Rules
 * Extensible concept ontology mapping diverse phrasing to standard schema fields
 */

export interface CanonicalConcept {
  key: string; // e.g. "education.school"
  vaultKey: string; // canonical vault key, e.g. "education.school"
  label: string; // display title, e.g. "School / Institution"
  description: string;
  category: 'identity' | 'contact' | 'education' | 'address' | 'emergency';
  exactMatches: string[];
  synonymPhrases: string[];
  regexPatterns: RegExp[];
  contextKeywords: string[];
  suggestedVaultField: string;
}

export const CANONICAL_FIELD_CATALOG: CanonicalConcept[] = [
  // 1. School / Institution
  {
    key: 'education.school',
    vaultKey: 'education.school',
    label: 'School / Institution',
    description: 'Current or most recent school, college, academy, or university attended',
    category: 'education',
    suggestedVaultField: 'school',
    exactMatches: [
      'current educational institution',
      'institution presently attended',
      'where do you currently study',
      'current school',
      'school currently attended',
      'college or university',
      'educational institution',
      'academic institution',
      'name of school',
      'university attended',
      'present university',
    ],
    synonymPhrases: [
      'school presently enrolled in',
      'institution currently attended',
      'present educational institute',
      'school attended',
      'college attending',
      'high school or secondary school',
      'secondary school presently attended',
      'alma mater',
    ],
    regexPatterns: [
      /\b(educational\s+institution|institution\s+(presently\s+)?attended|where\s+do\s+you\s+(currently\s+)?study|currently\s+study|current\s+(school|university|college)|academic\s+institution|secondary\s+school|alma\s+mater)\b/i,
    ],
    contextKeywords: ['study', 'attend', 'academic', 'college', 'university', 'campus', 'institution', 'enrolled'],
  },

  // 2. Program of Study / Course / Major
  {
    key: 'education.program',
    vaultKey: 'education.course',
    label: 'Programme / Course of Study',
    description: 'Major, declared academic concentration, degree subject, or discipline',
    category: 'education',
    suggestedVaultField: 'course',
    exactMatches: [
      'programme of study',
      'program of study',
      'course currently enrolled in',
      'course of study',
      'academic program',
      'major field of study',
      'declared major',
      'curriculum subject',
      'programme currently enrolled in',
    ],
    synonymPhrases: [
      'academic course',
      'field of specialization',
      'discipline enrolled in',
      'major subject',
      'concentration',
      'degree program',
    ],
    regexPatterns: [
      /\b(programme\s+(of\s+study|currently\s+enrolled)|program\s+(of\s+study|enrolled)|course\s+(currently\s+enrolled|of\s+study)|major\s+(\/|or)?\s*(academic\s+)?focus|academic\s+major|declared\s+major|concentration)\b/i,
    ],
    contextKeywords: ['curriculum', 'degree', 'major', 'discipline', 'specialization', 'department', 'field'],
  },

  // 3. Expected Graduation Year
  {
    key: 'education.graduationYear',
    vaultKey: 'education.gradYear',
    label: 'Expected Graduation Year',
    description: 'Year degree or certificate will be conferred',
    category: 'education',
    suggestedVaultField: 'gradYear',
    exactMatches: [
      'expected year of graduation',
      'expected graduation year',
      'year of graduation',
      'graduation target year',
      'expected year of conferral',
      'anticipated graduation date',
      'expected completion year',
    ],
    synonymPhrases: [
      'commencement year',
      'projected graduation',
      'year of degree completion',
      'conferral year',
    ],
    regexPatterns: [
      /\b(expected\s+(year\s+of\s+)?graduat(ion|e)|graduation\s+(target\s+)?year|year\s+of\s+conferral|anticipated\s+completion\s+year|commencement\s+year)\b/i,
    ],
    contextKeywords: ['commencement', 'conferral', 'degree', 'alumni', 'graduating', 'completion'],
  },

  // 4. Current Level of Study
  {
    key: 'education.level',
    vaultKey: 'education.level',
    label: 'Current Level of Study',
    description: 'Academic standing such as Undergraduate, Secondary, or Postgraduate',
    category: 'education',
    suggestedVaultField: 'level',
    exactMatches: [
      'current level of study',
      'academic level',
      'class standing',
      'year rank',
      'education level',
      'academic standing',
    ],
    synonymPhrases: [
      'undergraduate or postgraduate standing',
      'current student cohort level',
      'year of study',
      'academic classification',
    ],
    regexPatterns: [
      /\b(current\s+level\s+of\s+study|academic\s+(level|standing)|class\s+standing|year\s+rank|educational\s+level|study\s+level)\b/i,
    ],
    contextKeywords: ['sophomore', 'junior', 'senior', 'freshman', 'undergraduate', 'postgraduate', 'standing'],
  },

  // 5. Contact Email
  {
    key: 'contact.email',
    vaultKey: 'contact.email',
    label: 'Email Address',
    description: 'Primary electronic mail address for announcements and correspondence',
    category: 'contact',
    suggestedVaultField: 'email',
    exactMatches: [
      'contact email',
      'email address',
      'electronic mail address',
      'primary email',
      'e-mail',
      'email',
      'candidate email',
      'inbox address',
    ],
    synonymPhrases: [
      'work or personal email',
      'digital correspondence email',
      'applicant email contact',
      'email for notifications',
    ],
    regexPatterns: [
      /\b(contact\s+email|email\s+address|electronic\s+mail|primary\s+email|e-mail|inbox)\b/i,
    ],
    contextKeywords: ['inbox', 'electronic', 'notifications', 'correspondence', 'mail', 'digital'],
  },

  // 6. Contact Phone / Telephone
  {
    key: 'contact.phone',
    vaultKey: 'contact.phone',
    label: 'Phone Number',
    description: 'Mobile or direct telephone line including area/country code',
    category: 'contact',
    suggestedVaultField: 'phone',
    exactMatches: [
      'telephone contact',
      'mobile number',
      'contact telephone',
      'mobile telephone',
      'phone number',
      'cell phone',
      'cellular number',
      'direct contact line',
    ],
    synonymPhrases: [
      'telephone line',
      'mobile device contact',
      'applicant telephone',
      'daytime phone',
      'sms contact',
    ],
    regexPatterns: [
      /\b(telephone\s+contact|mobile\s+number|contact\s+telephone|mobile\s+telephone|phone\s+number|cell(ular)?\s+phone|voice\s+number)\b/i,
    ],
    contextKeywords: ['sms', 'cellular', 'direct', 'call', 'mobile', 'telephone', 'voice'],
  },

  // 7. Full Legal Name
  {
    key: 'identity.fullName',
    vaultKey: 'identity.fullName',
    label: 'Full Legal Name',
    description: 'Complete formal name as registered on government and birth credentials',
    category: 'identity',
    suggestedVaultField: 'fullName',
    exactMatches: [
      'legal name',
      'full legal name',
      'full name',
      'complete formal name',
      'applicant name',
      'candidate name',
      'applicant given & family name',
      'applicant full name',
    ],
    synonymPhrases: [
      'name in full',
      'complete legal name',
      'formal name',
      'registered birth name',
      'official passport name',
    ],
    regexPatterns: [
      /\b(full\s+legal\s+name|legal\s+name|complete\s+(formal\s+)?name|applicant\s+name|candidate\s+name|given\s+(&|and)\s+family\s+name)\b/i,
    ],
    contextKeywords: ['passport', 'government', 'certificate', 'official', 'record', 'formal', 'legal'],
  },

  // 8. Given Name / First Name
  {
    key: 'identity.firstName',
    vaultKey: 'identity.firstName',
    label: 'Given Name (First Name)',
    description: 'First or given name',
    category: 'identity',
    suggestedVaultField: 'firstName',
    exactMatches: [
      'given name',
      'first name',
      'forename',
      'christian name',
      'first legal name',
    ],
    synonymPhrases: [
      'primary given name',
      'given forename',
    ],
    regexPatterns: [
      /\b(given\s+name|first\s+name|forename|christian\s+name)\b/i,
    ],
    contextKeywords: ['given', 'forename', 'first'],
  },

  // 9. Family Name / Last Name
  {
    key: 'identity.lastName',
    vaultKey: 'identity.lastName',
    label: 'Family Name (Last Name)',
    description: 'Surname or family name',
    category: 'identity',
    suggestedVaultField: 'lastName',
    exactMatches: [
      'family name',
      'last name',
      'surname',
      'patronymic / family name',
    ],
    synonymPhrases: [
      'legal surname',
      'hereditary name',
      'family surname',
    ],
    regexPatterns: [
      /\b(family\s+name|last\s+name|surname)\b/i,
    ],
    contextKeywords: ['surname', 'family', 'clan'],
  },

  // 10. Date of Birth
  {
    key: 'identity.dateOfBirth',
    vaultKey: 'identity.dob',
    label: 'Date of Birth',
    description: 'Calendar date of birth (YYYY-MM-DD)',
    category: 'identity',
    suggestedVaultField: 'dob',
    exactMatches: [
      'date of birth',
      'birth date',
      'dob',
      'day of birth',
      'born on',
      'date of birth yyyy mm dd',
    ],
    synonymPhrases: [
      'birthdate',
      'chronological birth date',
      'applicant birth date',
    ],
    regexPatterns: [
      /\b(date\s+of\s+birth|dob|birth\s*date|day\s+of\s+birth|born\s+on)\b/i,
    ],
    contextKeywords: ['calendar', 'birth', 'chronological', 'age', 'year', 'month', 'day'],
  },

  // 11. Preferred Name
  {
    key: 'identity.preferredName',
    vaultKey: 'identity.preferredName',
    label: 'Preferred Name',
    description: 'Chosen nickname or informal salutation name',
    category: 'identity',
    suggestedVaultField: 'preferredName',
    exactMatches: [
      'preferred name',
      'what should we call you',
      'nickname',
      'chosen name',
      'preferred moniker',
    ],
    synonymPhrases: [
      'informal name',
      'display name',
      'casual salutation',
    ],
    regexPatterns: [
      /\b(preferred\s+name|what\s+should\s+we\s+call\s+you|nickname|chosen\s+name|preferred\s+moniker)\b/i,
    ],
    contextKeywords: ['informal', 'slack', 'team', 'salutation', 'call', 'nickname'],
  },

  // 12. Residential Address / Street
  {
    key: 'address.street',
    vaultKey: 'address.street',
    label: 'Street Address',
    description: 'Permanent domicile address line or residence street',
    category: 'address',
    suggestedVaultField: 'street',
    exactMatches: [
      'permanent residential address',
      'street address',
      'domicile street address',
      'residence street',
      'mailing address line 1',
      'home address',
    ],
    synonymPhrases: [
      'physical living address',
      'residential street line',
      'domicile address',
    ],
    regexPatterns: [
      /\b(residential\s+address|street\s+address|domicile\s+street|home\s+address|residence\s+address)\b/i,
    ],
    contextKeywords: ['street', 'avenue', 'apartment', 'suite', 'domicile', 'residence'],
  },

  // 13. City / Municipality
  {
    key: 'address.city',
    vaultKey: 'address.city',
    label: 'City / Municipality',
    description: 'City, town, or municipality of primary residence',
    category: 'address',
    suggestedVaultField: 'city',
    exactMatches: [
      'town or city of domicile',
      'city of residence',
      'city',
      'municipality',
      'town',
    ],
    synonymPhrases: [
      'residential city',
      'home town',
      'municipality of residence',
    ],
    regexPatterns: [
      /\b(town\s+or\s+city|city\s+of\s+residence|residential\s+city|municipality)\b/i,
    ],
    contextKeywords: ['municipality', 'town', 'metro', 'borough'],
  },

  // 14. State / Province
  {
    key: 'address.state',
    vaultKey: 'address.state',
    label: 'State / Province / Region',
    description: 'State, province, county, or territorial administrative region',
    category: 'address',
    suggestedVaultField: 'state',
    exactMatches: [
      'state province region',
      'state or province',
      'state',
      'province',
      'region',
      'administrative territory',
    ],
    synonymPhrases: [
      'residential state',
      'provincial region',
    ],
    regexPatterns: [
      /\b(state\s+(\/|or)?\s*province|state\s*\/\s*province\s*\/\s*region|province|territory|canton)\b/i,
    ],
    contextKeywords: ['prefecture', 'province', 'state', 'territory', 'region'],
  },

  // 15. Country of Residence
  {
    key: 'address.country',
    vaultKey: 'address.country',
    label: 'Country of Residence',
    description: 'Sovereign nation or country of primary domicile',
    category: 'address',
    suggestedVaultField: 'country',
    exactMatches: [
      'country of citizenship residence',
      'country of residence',
      'country',
      'nation of domicile',
      'sovereign nation',
    ],
    synonymPhrases: [
      'residence country',
      'nation of citizenship',
    ],
    regexPatterns: [
      /\b(country\s+of\s+(citizenship|residence)|nation\s+of\s+domicile|residence\s+country)\b/i,
    ],
    contextKeywords: ['nation', 'country', 'citizenship', 'nationality'],
  },

  // 16. Emergency Contact Name
  {
    key: 'emergency.name',
    vaultKey: 'emergency.name',
    label: 'Emergency Contact Person',
    description: 'Designated contact individual in case of unforeseen emergency',
    category: 'emergency',
    suggestedVaultField: 'name',
    exactMatches: [
      'designated emergency contact name',
      'emergency contact person',
      'emergency contact name',
      'next of kin name',
      'emergency liaison',
    ],
    synonymPhrases: [
      'emergency contact individual',
      'in case of emergency name',
    ],
    regexPatterns: [
      /\b(emergency\s+contact(\s+person|\s+name)?|next\s+of\s+kin\s+name|emergency\s+liaison)\b/i,
    ],
    contextKeywords: ['emergency', 'urgent', 'kin', 'guardian', 'liaison', 'hospital'],
  },

  // 17. Emergency Relationship / Kinship
  {
    key: 'emergency.relationship',
    vaultKey: 'emergency.relationship',
    label: 'Emergency Contact Kinship',
    description: 'Applicant relationship to emergency contact (e.g. Parent, Guardian)',
    category: 'emergency',
    suggestedVaultField: 'relationship',
    exactMatches: [
      'kinship relationship to candidate',
      'emergency contact relationship',
      'relationship to emergency contact',
      'kinship',
      'relation to applicant',
    ],
    synonymPhrases: [
      'emergency kinship',
      'relation of emergency liaison',
    ],
    regexPatterns: [
      /\b(kinship|relationship\s+to\s+(candidate|applicant)|emergency\s+relationship|relation\s+to\s+candidate)\b/i,
    ],
    contextKeywords: ['parent', 'mother', 'father', 'guardian', 'sibling', 'kinship', 'relative'],
  },

  // 18. Emergency Phone
  {
    key: 'emergency.phone',
    vaultKey: 'emergency.phone',
    label: 'Emergency Telephone Line',
    description: 'Direct telephone line for emergency liaison',
    category: 'emergency',
    suggestedVaultField: 'phone',
    exactMatches: [
      'emergency telephone line',
      'emergency phone number',
      'emergency telephone',
      'emergency direct line',
      '24 7 emergency hotline',
    ],
    synonymPhrases: [
      'emergency cell number',
      'emergency contact telephone',
    ],
    regexPatterns: [
      /\b(emergency\s+(telephone|phone|mobile|cell|direct\s+line)|emergency\s+hotline)\b/i,
    ],
    contextKeywords: ['emergency', 'urgent', 'hotline', 'nighttime', 'direct line'],
  },
];

/**
 * Normalizes any free-form string into a clean lowercase tokenized string
 */
export function normalizeLabelString(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic Semantic Concept Matcher
 * Maps diverse wording to canonical concepts using exact match, synonyms, and context.
 */
export function findCanonicalConcept(
  label: string,
  context?: string
): {
  concept: CanonicalConcept;
  confidence: number;
  reason: string;
  isExact: boolean;
} | null {
  const norm = normalizeLabelString(label);
  if (!norm) return null;

  // 1. Check exact string matches (98% confidence)
  for (const c of CANONICAL_FIELD_CATALOG) {
    for (const em of c.exactMatches) {
      if (normalizeLabelString(em) === norm) {
        return {
          concept: c,
          confidence: 98,
          reason: `Exact semantic match for canonical concept '${c.label}'.`,
          isExact: true,
        };
      }
    }
  }

  // 2. Check strong synonym phrases (95% confidence)
  for (const c of CANONICAL_FIELD_CATALOG) {
    for (const syn of c.synonymPhrases) {
      if (normalizeLabelString(syn) === norm) {
        return {
          concept: c,
          confidence: 95,
          reason: `Strong synonym match for canonical concept '${c.label}'.`,
          isExact: false,
        };
      }
    }
  }

  // 3. Check regex pattern matches (93-96% confidence)
  for (const c of CANONICAL_FIELD_CATALOG) {
    for (const pattern of c.regexPatterns) {
      if (pattern.test(norm) || pattern.test(label)) {
        // Boost confidence if context keywords agree (+3%)
        let bonus = 0;
        if (context) {
          const normContext = normalizeLabelString(context);
          const hasContextMatch = c.contextKeywords.some((kw) => normContext.includes(kw));
          if (hasContextMatch) bonus = 3;
        }

        const score = Math.min(97, 93 + bonus);
        return {
          concept: c,
          confidence: score,
          reason: `Matched pattern rules for ${c.label}${bonus > 0 ? ' with contextual agreement' : ''}.`,
          isExact: false,
        };
      }
    }
  }

  // 4. Token overlap matching for composite questions (e.g. "Where do you currently study?")
  const tokens = norm.split(' ').filter((t) => t.length > 2);
  let bestConcept: CanonicalConcept | null = null;
  let bestScore = 0;

  for (const c of CANONICAL_FIELD_CATALOG) {
    // Check if label contains key identifying words
    let matchesCount = 0;
    for (const em of c.exactMatches) {
      const emTokens = em.split(' ');
      const common = tokens.filter((t) => emTokens.includes(t));
      if (common.length > matchesCount) {
        matchesCount = common.length;
      }
    }

    if (matchesCount >= 2 && matchesCount > bestScore) {
      bestScore = matchesCount;
      bestConcept = c;
    }
  }

  if (bestConcept && bestScore >= 2) {
    return {
      concept: bestConcept,
      confidence: 88,
      reason: `Semantic token alignment identifies this field as '${bestConcept.label}'.`,
      isExact: false,
    };
  }

  return null;
}
