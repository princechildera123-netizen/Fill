import { VaultData, VaultFieldMeta } from '../types/fill';

export const VAULT_FIELD_DEFINITIONS: VaultFieldMeta[] = [
  // Identity
  {
    key: 'identity.firstName',
    category: 'Identity',
    label: 'First Name',
    description: 'Given name as stated on official records',
    placeholder: 'e.g. Maya',
    type: 'text',
  },
  {
    key: 'identity.middleName',
    category: 'Identity',
    label: 'Middle Name',
    description: 'Middle name or initial (optional)',
    placeholder: 'e.g. Christine',
    type: 'text',
  },
  {
    key: 'identity.lastName',
    category: 'Identity',
    label: 'Last Name',
    description: 'Family name or surname',
    placeholder: 'e.g. Lin',
    type: 'text',
  },
  {
    key: 'identity.preferredName',
    category: 'Identity',
    label: 'Preferred Name',
    description: 'Informal or chosen name',
    placeholder: 'e.g. May',
    type: 'text',
  },
  {
    key: 'identity.dob',
    category: 'Identity',
    label: 'Date of Birth',
    description: 'Birth date (YYYY-MM-DD)',
    placeholder: '2004-05-18',
    type: 'date',
  },

  // Contact
  {
    key: 'contact.email',
    category: 'Contact',
    label: 'Email Address',
    description: 'Primary personal or academic email',
    placeholder: 'maya.lin@domain.edu',
    type: 'email',
  },
  {
    key: 'contact.phone',
    category: 'Contact',
    label: 'Phone Number',
    description: 'Mobile or contact telephone number',
    placeholder: '+1 (555) 234-5678',
    type: 'tel',
  },

  // Education
  {
    key: 'education.school',
    category: 'Education',
    label: 'School / Institution',
    description: 'Current or most recent university, college, or school',
    placeholder: 'Stanford University',
    type: 'text',
  },
  {
    key: 'education.course',
    category: 'Education',
    label: 'Course / Program',
    description: 'Major, program of study, or discipline',
    placeholder: 'B.S. Computer Science & AI',
    type: 'text',
  },
  {
    key: 'education.level',
    category: 'Education',
    label: 'Level of Study',
    description: 'Academic standing (Undergraduate, Postgraduate, etc.)',
    placeholder: 'Undergraduate (Junior)',
    type: 'text',
  },
  {
    key: 'education.gradYear',
    category: 'Education',
    label: 'Graduation Year',
    description: 'Expected or conferral year',
    placeholder: '2027',
    type: 'text',
  },

  // Address
  {
    key: 'address.country',
    category: 'Address',
    label: 'Country',
    description: 'Country of primary or legal residence',
    placeholder: 'United States',
    type: 'text',
  },
  {
    key: 'address.state',
    category: 'Address',
    label: 'State / Region / Province',
    description: 'State, province, or territory',
    placeholder: 'California',
    type: 'text',
  },
  {
    key: 'address.city',
    category: 'Address',
    label: 'City / Town',
    description: 'City or municipality',
    placeholder: 'Palo Alto',
    type: 'text',
  },
  {
    key: 'address.street',
    category: 'Address',
    label: 'Street Address',
    description: 'Permanent street address & apartment/unit',
    placeholder: '450 Jane Stanford Way, Apt 3B',
    type: 'text',
  },

  // Emergency Contact
  {
    key: 'emergency.name',
    category: 'Emergency Contact',
    label: 'Emergency Contact Name',
    description: 'Full name of designated emergency contact',
    placeholder: 'Elena Lin',
    type: 'text',
  },
  {
    key: 'emergency.relationship',
    category: 'Emergency Contact',
    label: 'Emergency Contact Relationship',
    description: 'Relationship to applicant (e.g., Parent, Guardian, Spouse)',
    placeholder: 'Parent / Mother',
    type: 'text',
  },
  {
    key: 'emergency.phone',
    category: 'Emergency Contact',
    label: 'Emergency Contact Phone',
    description: 'Telephone number for urgent contact',
    placeholder: '+1 (555) 987-6543',
    type: 'tel',
  },
];

export const INITIAL_EMPTY_VAULT: VaultData = {
  identity: {
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    dob: '',
  },
  contact: {
    email: '',
    phone: '',
  },
  education: {
    school: '',
    course: '',
    level: '',
    gradYear: '',
  },
  address: {
    country: '',
    state: '',
    city: '',
    street: '',
  },
  emergency: {
    name: '',
    relationship: '',
    phone: '',
  },
};

/** Realistic fictional student sample vault conforming to Section 11 */
export const SAMPLE_STUDENT_VAULT: VaultData = {
  identity: {
    firstName: 'Alex',
    middleName: 'R.',
    lastName: 'Morgan',
    preferredName: 'Alex',
    dob: '2008-04-12',
  },
  contact: {
    email: 'alex@example.com',
    phone: '+1 555 010 1234',
  },
  education: {
    school: 'Riverside Secondary School',
    course: 'Computer Science',
    level: 'Senior Secondary',
    gradYear: '2027',
  },
  address: {
    country: 'United States',
    state: 'California',
    city: 'Riverside',
    street: '1240 University Avenue, Suite 3B',
  },
  emergency: {
    name: 'Jordan Morgan',
    relationship: 'Parent / Legal Guardian',
    phone: '+1 555 010 9988',
  },
};

export function getVaultValueByKey(vault: VaultData, key: string | null): string {
  if (!key) return '';

  // Special computed keys
  if (key === 'identity.fullName') {
    const parts = [vault.identity.firstName, vault.identity.middleName, vault.identity.lastName].filter(Boolean);
    return parts.join(' ');
  }
  if (key === 'identity.firstLast') {
    return [vault.identity.firstName, vault.identity.lastName].filter(Boolean).join(' ');
  }
  if (key === 'address.fullAddress') {
    const parts = [vault.address.street, vault.address.city, vault.address.state, vault.address.country].filter(Boolean);
    return parts.join(', ');
  }

  const [section, field] = key.split('.');
  if (!section || !field) return '';

  const sectionObj = (vault as unknown as Record<string, Record<string, string>>)[section];
  if (!sectionObj) return '';

  return sectionObj[field] || '';
}

export function setVaultValueByKey(vault: VaultData, key: string, value: string): VaultData {
  const [section, field] = key.split('.');
  if (!section || !field) return vault;

  const currentSection = (vault as unknown as Record<string, Record<string, string>>)[section];
  if (!currentSection) return vault;

  return {
    ...vault,
    [section]: {
      ...currentSection,
      [field]: value,
    },
  };
}

export function calculateVaultCompleteness(vault: VaultData): {
  filledCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = VAULT_FIELD_DEFINITIONS.length;
  let filledCount = 0;

  for (const def of VAULT_FIELD_DEFINITIONS) {
    const val = getVaultValueByKey(vault, def.key);
    if (val && val.trim().length > 0) {
      filledCount++;
    }
  }

  const percentage = Math.round((filledCount / totalCount) * 100);
  return { filledCount, totalCount, percentage };
}
