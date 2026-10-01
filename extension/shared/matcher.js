/**
 * FILL Chrome Extension Shared Logic Engine
 * 
 * Implements the required 4-layer matching pipeline for the Chrome extension:
 * 1. Previously learned FILL Memory mappings (🧠 Remembered by FILL)
 * 2. Deterministic & canonical field ontology matching
 * 3. Semantic synonym & regex heuristics
 * 4. Transparent confidence scoring & Safety Guard
 * 
 * Safety & Privacy:
 * - Sensitive fields (password, payment, SSN) are never filled.
 * - Minimum data is passed to the web page (only approved fields).
 * - No auto-submit.
 */

export const EXTENSION_CANONICAL_RULES = [
  // Full Name
  {
    key: 'identity.fullName',
    label: 'Full Name',
    exacts: ['full name', 'candidate name', 'legal name', 'candidate legal name', 'student name', 'your name', 'applicant name', 'name of applicant'],
    synonyms: ['name', 'complete name', 'formal name'],
    regex: /\b(full\s*name|candidate\s*legal\s*name|legal\s*name|applicant\s*name)\b/i,
  },
  // First Name
  {
    key: 'identity.firstName',
    label: 'First Name',
    exacts: ['first name', 'given name', 'forename'],
    synonyms: ['first'],
    regex: /\b(first\s*name|given\s*name|forename)\b/i,
  },
  // Last Name
  {
    key: 'identity.lastName',
    label: 'Last Name',
    exacts: ['last name', 'family name', 'surname'],
    synonyms: ['last', 'family'],
    regex: /\b(last\s*name|family\s*name|surname)\b/i,
  },
  // Email
  {
    key: 'contact.email',
    label: 'Email',
    exacts: ['email', 'email address', 'electronic mail address', 'e-mail', 'mail address', 'contact email', 'student email'],
    synonyms: ['electronic mail', 'e-mail address'],
    regex: /\b(e[-]?mail(\s*address)?|electronic\s*mail)\b/i,
  },
  // Phone
  {
    key: 'contact.phone',
    label: 'Phone Number',
    exacts: ['phone number', 'contact number', 'phone', 'telephone', 'mobile number', 'cell number', 'contact telephone', 'telephone number'],
    synonyms: ['mobile', 'tel', 'cell phone'],
    regex: /\b(contact\s*number|phone\s*(number)?|telephone|mobile(\s*number)?|cell)\b/i,
  },
  // School / Institution
  {
    key: 'education.school',
    label: 'School',
    exacts: [
      'current educational institution',
      'institution presently attended',
      'current school',
      'school',
      'university',
      'college',
      'educational institution',
      'academic institution',
      'where do you currently study',
      'school currently attended',
      'institution currently attended'
    ],
    synonyms: ['collegiate establishment', 'alma mater', 'present school', 'present university', 'campus'],
    regex: /\b(current\s*educational\s*institution|institution\s*(presently|currently)\s*attended|educational\s*institution|school|university|college|academy)\b/i,
  },
  // Program / Course / Major
  {
    key: 'education.course',
    label: 'Course / Program',
    exacts: [
      'course of study',
      'academic programme',
      'academic program',
      'programme of study',
      'major',
      'degree program',
      'course',
      'field of study',
      'discipline',
      'subject area'
    ],
    synonyms: ['academic course', 'degree subject', 'concentration', 'curriculum'],
    regex: /\b(course\s*of\s*study|academic\s*programm?e|programm?e\s*of\s*study|major|degree\s*course|field\s*of\s*study)\b/i,
  },
  // Graduation Year
  {
    key: 'education.gradYear',
    label: 'Graduation Year',
    exacts: ['expected graduation year', 'graduation year', 'grad year', 'completion year', 'year of graduation'],
    synonyms: ['expected completion', 'class of', 'graduating year'],
    regex: /\b(graduation\s*year|expected\s*graduation|grad\s*year|completion\s*year)\b/i,
  },
  // City
  {
    key: 'address.city',
    label: 'City',
    exacts: ['city', 'city of residence', 'town', 'municipality'],
    synonyms: ['residential city', 'home city'],
    regex: /\b(city(\s*of\s*residence)?|town)\b/i,
  },
  // State
  {
    key: 'address.state',
    label: 'State / Province',
    exacts: ['state', 'province', 'region', 'state / province'],
    synonyms: ['county'],
    regex: /\b(state|province|region)\b/i,
  },
  // Country
  {
    key: 'address.country',
    label: 'Country',
    exacts: ['country', 'country of residence', 'nationality', 'citizenship'],
    synonyms: ['nation', 'national jurisdiction'],
    regex: /\b(country(\s*of\s*residence)?|nation)\b/i,
  },
  // Date of Birth
  {
    key: 'identity.dob',
    label: 'Date of Birth',
    exacts: ['date of birth', 'dob', 'birth date', 'birthdate'],
    synonyms: ['born on', 'birthday'],
    regex: /\b(date\s*of\s*birth|dob|birth\s*date)\b/i,
  }
];

export const DEFAULT_EXTENSION_VAULT = {
  identity: {
    firstName: 'Alex',
    middleName: '',
    lastName: 'Rivera',
    preferredName: 'Alex',
    dob: '2004-05-18',
  },
  contact: {
    email: 'alex@example.com',
    phone: '+1 555 010 1234',
  },
  education: {
    school: "Saint Patrick's College",
    course: 'Computer Science',
    level: 'Undergraduate',
    gradYear: '2027',
  },
  address: {
    country: 'United States',
    state: 'California',
    city: 'Riverside',
    street: '1240 University Avenue',
  },
  emergency: {
    name: 'Jordan Morgan',
    relationship: 'Parent / Legal Guardian',
    phone: '+1 555 010 9988',
  }
};

export const DEFAULT_EXTENSION_MEMORY = [
  {
    phrase: 'current educational institution',
    vaultKey: 'education.school',
    vaultTitle: 'School',
    confirmedAt: Date.now() - 3600000,
  },
  {
    phrase: 'institution presently attended',
    vaultKey: 'education.school',
    vaultTitle: 'School',
    confirmedAt: Date.now() - 1800000,
  }
];

/**
 * Normalizes any text label for clean comparison
 */
export function normalizeLabel(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[_\-.:*?#()/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Retrieves value from Vault structure by dot-key
 */
export function getVaultValue(vault, dotKey) {
  if (!vault || !dotKey) return '';
  if (dotKey === 'identity.fullName') {
    const fn = vault.identity?.firstName || '';
    const mn = vault.identity?.middleName || '';
    const ln = vault.identity?.lastName || '';
    return [fn, mn, ln].filter(Boolean).join(' ');
  }
  const [sec, prop] = dotKey.split('.');
  return vault[sec]?.[prop] || '';
}

/**
 * Matches detected DOM form fields against Vault and Memory
 */
export function matchDetectedFields(fields, vault, memory) {
  return fields.map((field) => {
    // 0. Safety Guard: Sensitive field check
    if (field.isSensitive) {
      return {
        ...field,
        vaultKey: null,
        vaultTitle: 'Sensitive Field',
        value: '',
        confidence: 'Low',
        confidenceScore: 0,
        status: 'unsupported',
        reason: 'Sensitive field not supported (safety guard).',
        isRemembered: false,
        approved: false,
      };
    }

    const normLabel = normalizeLabel(field.label);
    const normName = normalizeLabel(field.name);
    const normPlaceholder = normalizeLabel(field.placeholder);
    const normAuto = normalizeLabel(field.autocomplete);
    const combinedTokens = `${normLabel} ${normName} ${normPlaceholder} ${normAuto} ${normalizeLabel(field.context || '')}`.trim();

    // 1. Layer 1: Check FILL Memory (Previously confirmed mappings)
    if (Array.isArray(memory)) {
      for (const mem of memory) {
        const memPhrase = normalizeLabel(mem.phrase || mem.originalLabel || mem.sourcePhrase);
        if (memPhrase && (normLabel === memPhrase || combinedTokens.includes(memPhrase))) {
          const val = getVaultValue(vault, mem.vaultKey || mem.confirmedVaultField);
          return {
            ...field,
            vaultKey: mem.vaultKey || mem.confirmedVaultField,
            vaultTitle: mem.vaultTitle || mem.vaultFieldTitle || 'School',
            value: val,
            confidence: 'High',
            confidenceScore: 98,
            status: 'matched',
            reason: `🧠 Remembered by FILL: previously confirmed for "${mem.phrase}".`,
            isRemembered: true,
            approved: true,
          };
        }
      }
    }

    // 2. Layer 2: Deterministic Canonical Exact & Synonym Rules
    for (const rule of EXTENSION_CANONICAL_RULES) {
      // Check exact label match
      if (rule.exacts.some((e) => normLabel === e || normName === e || normPlaceholder === e)) {
        const val = getVaultValue(vault, rule.key);
        return {
          ...field,
          vaultKey: rule.key,
          vaultTitle: rule.label,
          value: val,
          confidence: 'High',
          confidenceScore: 95,
          status: 'matched',
          reason: `Exact semantic match for ${rule.label}.`,
          isRemembered: false,
          approved: true,
        };
      }

      // Check regex pattern against combined context
      if (rule.regex && rule.regex.test(combinedTokens)) {
        const val = getVaultValue(vault, rule.key);
        return {
          ...field,
          vaultKey: rule.key,
          vaultTitle: rule.label,
          value: val,
          confidence: 'High',
          confidenceScore: 90,
          status: 'matched',
          reason: `Matched to ${rule.label} based on semantic phrasing.`,
          isRemembered: false,
          approved: true,
        };
      }

      // Check synonyms
      if (rule.synonyms.some((s) => combinedTokens.includes(s))) {
        const val = getVaultValue(vault, rule.key);
        return {
          ...field,
          vaultKey: rule.key,
          vaultTitle: rule.label,
          value: val,
          confidence: 'Medium',
          confidenceScore: 75,
          status: 'needs_review',
          reason: `Associated with ${rule.label} via synonyms. Review required before filling.`,
          isRemembered: false,
          approved: false, // Guard: Require user confirmation for Medium/Low
        };
      }
    }

    // 3. Fallback: Unmatched field
    return {
      ...field,
      vaultKey: null,
      vaultTitle: 'Unmatched Field',
      value: '',
      confidence: 'Low',
      confidenceScore: 30,
      status: 'unmatched',
      reason: 'No confident Vault match found. Review required.',
      isRemembered: false,
      approved: false,
    };
  });
}
