export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const INFECTION_STATUSES = ['Yes', 'No', 'Unknown', 'Suspected'];

export const DISEASE_STATUSES = ['Active', 'Resolved', 'Chronic', 'In Treatment', 'Monitoring'];

export const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];

export const APPOINTMENT_TYPES = ['Regular', 'Follow-up', 'Emergency', 'Consultation', 'Lab'];

export const RECORD_TYPES = ['Visit', 'Lab Test', 'Follow-up', 'Emergency', 'Consultation'];

export const MEDICATION_ROUTES = [
  'Oral', 'IV (Intravenous)', 'IM (Intramuscular)', 'SC (Subcutaneous)',
  'Topical', 'Inhalation', 'Sublingual', 'Rectal', 'Nasal', 'Ophthalmic', 'Other',
];

export const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Hematology', 'Neurology', 'Oncology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Rheumatology', 'Surgery', 'Urology', 'Other',
];

export const TEST_STATUSES = ['Normal', 'Abnormal', 'Borderline', 'Pending'];

export const DATE_FILTER_OPTIONS = [
  { label: 'Today', value: 'today', days: 0 },
  { label: 'Last 7 Days', value: '7d', days: 7 },
  { label: 'Last 30 Days', value: '30d', days: 30 },
  { label: 'Last 3 Months', value: '3m', days: 90 },
  { label: 'Last Year', value: '1y', days: 365 },
  { label: 'Custom', value: 'custom', days: null },
];

export const CHART_COLORS = [
  '#3b82f6', '#0d9488', '#8b5cf6', '#f59e0b',
  '#ef4444', '#10b981', '#f97316', '#6366f1',
];
