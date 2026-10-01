import { FormFieldInput } from '../types/fill';

export interface DemoFormTemplate {
  id: string;
  code: 'FORM_A' | 'FORM_B';
  title: string;
  organization: string;
  description: string;
  badge: string;
  fields: FormFieldInput[];
}

export const DEMO_FORM_A: DemoFormTemplate = {
  id: 'demo-scholarship-application-a',
  code: 'FORM_A',
  title: 'Global Merit Undergraduate Scholarship Application',
  organization: 'International Education Foundation',
  description: 'Standard competitive academic merit grant application with formal academic phrasing.',
  badge: 'Academic Grant • Form A',
  fields: [
    {
      id: 'fa_1',
      label: 'Full Legal Name',
      context: 'Candidate formal name matching passport or birth record',
      sectionHint: 'Personal Information',
    },
    {
      id: 'fa_2',
      label: 'Preferred Name / Moniker',
      context: 'Informal salutation name during committee correspondence',
      sectionHint: 'Personal Information',
    },
    {
      id: 'fa_3',
      label: 'Date of Birth (YYYY-MM-DD)',
      context: 'Applicant chronological birth date',
      sectionHint: 'Personal Information',
    },
    {
      id: 'fa_4',
      label: 'Electronic Mail Address',
      context: 'Primary official inbox for grant announcements',
      sectionHint: 'Contact Details',
    },
    {
      id: 'fa_5',
      label: 'Contact Telephone',
      context: 'Mobile or direct phone line with country code',
      sectionHint: 'Contact Details',
    },
    {
      id: 'fa_6',
      label: 'Current Educational Institution',
      context: 'University, academy, or collegiate institute presently attending',
      sectionHint: 'Academic Standing',
    },
    {
      id: 'fa_7',
      label: 'Programme of Study',
      context: 'Degree subject, declared major, or concentration',
      sectionHint: 'Academic Standing',
    },
    {
      id: 'fa_8',
      label: 'Current Level of Study',
      context: 'Undergraduate sophomore/junior/senior or graduate cohort',
      sectionHint: 'Academic Standing',
    },
    {
      id: 'fa_9',
      label: 'Expected Year of Conferral',
      context: 'Year bachelor or candidate degree will be formally awarded',
      sectionHint: 'Academic Standing',
    },
    {
      id: 'fa_10',
      label: 'Permanent Residential Address',
      context: 'Physical street location of family home or primary residence',
      sectionHint: 'Domicile',
    },
    {
      id: 'fa_11',
      label: 'Town or City of Domicile',
      context: 'Municipality of residence',
      sectionHint: 'Domicile',
    },
    {
      id: 'fa_12',
      label: 'State / Province / Region',
      context: 'Regional territorial jurisdiction',
      sectionHint: 'Domicile',
    },
    {
      id: 'fa_13',
      label: 'Country of Citizenship/Residence',
      context: 'Sovereign nation of residence',
      sectionHint: 'Domicile',
    },
    {
      id: 'fa_14',
      label: 'Designated Emergency Contact Name',
      context: 'Full name of individual to reach in sudden medical emergency',
      sectionHint: 'Emergency Notifications',
    },
    {
      id: 'fa_15',
      label: 'Kinship / Relationship to Candidate',
      context: 'e.g. Parent, Guardian, Next of Kin',
      sectionHint: 'Emergency Notifications',
    },
    {
      id: 'fa_16',
      label: 'Emergency Telephone Line',
      context: 'Direct telephone number for emergency liaison',
      sectionHint: 'Emergency Notifications',
    },
  ],
};

export const DEMO_FORM_B: DemoFormTemplate = {
  id: 'demo-fellowship-registration-b',
  code: 'FORM_B',
  title: 'Tech Pioneer Fellowship & Internship Registration',
  organization: 'NextGen Engineering Ventures',
  description: 'Summer fellowship engineering cohort intake using completely varied colloquial and industry phrasing.',
  badge: 'Industry Fellowship • Form B',
  fields: [
    {
      id: 'fb_1',
      label: 'Applicant Given & Family Name',
      context: 'Primary name used for official HR onboarding paperwork',
      sectionHint: 'Fellow Profile',
    },
    {
      id: 'fb_2',
      label: 'What should we call you?',
      context: 'Preferred team display name on Slack and code reviews',
      sectionHint: 'Fellow Profile',
    },
    {
      id: 'fb_3',
      label: 'Birth Date',
      context: 'Verification for fellowship age cohort compliance',
      sectionHint: 'Fellow Profile',
    },
    {
      id: 'fb_4',
      label: 'Primary Work / Personal Email',
      context: 'Direct inbox for interview invites and offer letters',
      sectionHint: 'Communications',
    },
    {
      id: 'fb_5',
      label: 'Mobile Number',
      context: 'Direct cellular device contact',
      sectionHint: 'Communications',
    },
    {
      id: 'fb_6',
      label: 'Institution Presently Attended',
      context: 'College or university where currently taking classes',
      sectionHint: 'Education Background',
    },
    {
      id: 'fb_7',
      label: 'Major / Academic Focus Area',
      context: 'Undergraduate curriculum major or specialization',
      sectionHint: 'Education Background',
    },
    {
      id: 'fb_8',
      label: 'Class Standing / Year Rank',
      context: 'Freshman, Sophomore, Junior, Senior, or Master candidate',
      sectionHint: 'Education Background',
    },
    {
      id: 'fb_9',
      label: 'Graduation Target Year',
      context: 'Projected commencement calendar year',
      sectionHint: 'Education Background',
    },
    {
      id: 'fb_10',
      label: 'Street / Apartment Delivery Address',
      context: 'Physical address to ship fellowship laptop and welcome gear',
      sectionHint: 'Shipping Location',
    },
    {
      id: 'fb_11',
      label: 'Metropolitan Area / City',
      context: 'City municipality of residence',
      sectionHint: 'Shipping Location',
    },
    {
      id: 'fb_12',
      label: 'State or Territory',
      context: 'State location',
      sectionHint: 'Shipping Location',
    },
    {
      id: 'fb_13',
      label: 'Nation of Origin / Residence',
      context: 'Country where you will reside during the summer session',
      sectionHint: 'Shipping Location',
    },
    {
      id: 'fb_14',
      label: 'Emergency Liaison Person',
      context: 'Contact person in case of workplace urgent incident',
      sectionHint: 'Urgent Care',
    },
    {
      id: 'fb_15',
      label: 'Connection / Relation to Applicant',
      context: 'Family or personal relationship',
      sectionHint: 'Urgent Care',
    },
    {
      id: 'fb_16',
      label: 'Emergency Phone Number',
      context: '24/7 accessible phone number',
      sectionHint: 'Urgent Care',
    },
  ],
};

export const ALL_DEMO_FORMS: DemoFormTemplate[] = [DEMO_FORM_A, DEMO_FORM_B];
