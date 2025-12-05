// Form status types
export type FormStatus = 'draft' | 'in_progress' | 'complete' | 'submitted';

// Collaborator type
export interface Collaborator {
  odId: string;
  joinedAt: Date;
  lastActiveAt: Date;
  name?: string;
  color?: string;
}

// Form data structure
export interface FormData {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  title: string;
  company: string;
  city: string;
  state: string;
  country: string;
  description: string;
  tags: string[];
  sourceTypeId: number | null;
  compensation: number | null;
  compensationNotes: string;
}

// Complete intake form document
export interface IntakeForm {
  _id?: string;
  formId: string;
  status: FormStatus;
  loxoPersonId: number | null;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  data: FormData;
  collaborators: Collaborator[];
}

// Socket events
export interface ServerToClientEvents {
  'field-updated': (data: { field: keyof FormData; value: unknown; userId: string }) => void;
  'field-locked': (data: { field: keyof FormData; userId: string }) => void;
  'field-unlocked': (data: { field: keyof FormData }) => void;
  'collaborators': (collaborators: Collaborator[]) => void;
  'user-joined': (data: { userId: string; color: string }) => void;
  'user-left': (data: { userId: string }) => void;
  'form-data': (data: FormData) => void;
  'form-saved': () => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'join-form': (data: { formId: string }) => void;
  'leave-form': (data: { formId: string }) => void;
  'field-update': (data: { formId: string; field: keyof FormData; value: unknown }) => void;
  'field-lock': (data: { formId: string; field: keyof FormData }) => void;
  'field-unlock': (data: { formId: string; field: keyof FormData }) => void;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Loxo API types
export interface LoxoPersonResponse {
  id: number;
  name: string;
  email: string;
  [key: string]: unknown;
}

// =============================================================================
// HIRING INTAKE FORM TYPES
// =============================================================================

// Work arrangement options
export type WorkArrangement = 'remote' | 'onsite' | 'hybrid';

// Client/Company contact information
export interface ClientContact {
  name: string;
  email: string;
  mobilePhone?: string;
  officePhone?: string;
  notes?: string;
}

// Company address structure
export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Fee structure information
export interface FeeStructure {
  feePercents?: string; // e.g., "20/22.5/25"
  flatFees?: string; // e.g., "$3500/$5500"
  terms?: string; // e.g., "Hire/45/90/135"
  rawString: string; // Original fee structure string
}

// Client company information
export interface ClientCompanyInfo {
  name: string;
  address: CompanyAddress;
  contactName: string;
  contacts: ClientContact[];
  feeStructure: FeeStructure;
}

// Compensation details
export interface CompensationInfo {
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string; // e.g., "$100K to $200K"
  hourlyRate?: number;
  salaryType?: 'hourly' | 'annual' | 'project';
  bonus?: string; // e.g., "$401k 3%, profit sharing share 3%"
  benefits?: string; // e.g., "100% paid health after a year, 100% covered health insurance"
  notes?: string;
}

// Recruiting/Interview process info
export interface RecruitingProcess {
  otherSearchFirms?: string;
  mustHaveInterviewers?: string;
  notes?: string;
}

// Timeline info
export interface TimelineInfo {
  keyMilestones?: string;
  candidateSatisfactionSurvey?: string;
  cadenceOfCheckIns?: string;
  targetNPS?: string;
  notes?: string;
}

// Working together info
export interface WorkingTogetherInfo {
  levelOfPriority?: number; // 1-5
  expectedTurnaroundTime?: string; // e.g., "2 day max"
  feedbackExpectations?: string;
  clientTimePercentage?: string;
  preferredStatusMethod?: string; // meetings, emails, phone calls, texts, etc.
  clientExpectationForCandidates?: string;
  notes?: string;
}

// Company overview/sourcing criteria
export interface SourcingCriteria {
  targetCompanies?: string[];
  employees?: string; // e.g., "10 employees Candidate will be reporting and paid by STONE PA. Andrew + 2 attorneys"
  competitors?: string;
  personalityTraits?: string; // Emotional Quotient/Core Values
  doNotTouch?: string;
  discProfile?: string; // DISC/IP desired profile
  internalCandidates?: string;
  notes?: string;
}

// Completion info (internal use only)
export interface CompletionInfo {
  completionDate?: string;
  whatWorked?: string;
  lessonsLearned?: string;
  whatDidNotWork?: string;
  actionsForImprovement?: string;
  notes?: string;
}

// Hiring Intake Form data structure (maps to the COMPLETE form template)
export interface HiringIntakeFormData {
  // ==========================================================================
  // SECTION 1: Client/Company Info
  // ==========================================================================
  clientCompany: ClientCompanyInfo;
  meetingDate: string; // ISO date string

  // ==========================================================================
  // SECTION 2: Background
  // ==========================================================================
  jobTitle: string;
  targetCompanies?: string[]; // Companies to source from
  workArrangement?: WorkArrangement;
  workArrangementDetails?: string; // e.g., "Hybrid- 3 days in ofc for Assoc. Remote for a senior Atty."
  targetStartDate?: string; // "ASAP" or ISO date
  experienceLevel?: string; // e.g., "3 yr. To 20 yrs experience"
  reasonForHire?: string; // Filling A Gap, New Role Needs
  directManager?: string; // e.g., "Reports to Andrew"
  successCriteria?: string; // What does Success Look Like?
  department?: string; // e.g., "10 employees, 2 attorneys, 4 paralegals"
  jobOverview?: string; // Full job overview text
  coreResponsibilities?: string; // Core Responsibilities/Competency
  industryExperience?: string; // Industry Experience Necessary?

  // ==========================================================================
  // SECTION 3: Skills & Requirements
  // ==========================================================================
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  sampleCareerTrajectory?: string;
  impactIfNotFilled?: string; // Without having this position filled...
  impactIfFilled?: string; // What is the result of having the position filled?

  // ==========================================================================
  // SECTION 4: Job Responsibilities/Skills - Company Overview/Sourcing Criteria
  // ==========================================================================
  sourcingCriteria?: SourcingCriteria;

  // ==========================================================================
  // SECTION 5: Compensation
  // ==========================================================================
  compensation?: CompensationInfo;

  // ==========================================================================
  // SECTION 6: Recruiting/Interview Process
  // ==========================================================================
  recruitingProcess?: RecruitingProcess;

  // ==========================================================================
  // SECTION 7: Timeline
  // ==========================================================================
  timeline?: TimelineInfo;

  // ==========================================================================
  // SECTION 8: Working Together
  // ==========================================================================
  workingTogether?: WorkingTogetherInfo;

  // ==========================================================================
  // SECTION 9: Next Steps
  // ==========================================================================
  immediateActionItems?: string;

  // ==========================================================================
  // SECTION 10: Completion (Internal Use Only)
  // ==========================================================================
  completion?: CompletionInfo;
}

// Complete Hiring Intake Form document (stored in MongoDB)
export interface HiringIntakeForm {
  _id?: string;
  formId: string;
  status: FormStatus;
  loxoJobId: number | null;
  loxoCompanyId: number | null;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  data: HiringIntakeFormData;
  collaborators: Collaborator[];
}

// =============================================================================
// LOXO JOBS API TYPES
// =============================================================================

// LOXO Reference data types
export interface LoxoReferenceItem {
  id: number;
  name: string;
  [key: string]: unknown;
}

export type LoxoJobType = LoxoReferenceItem;
export type LoxoJobStatus = LoxoReferenceItem;
export type LoxoJobCategory = LoxoReferenceItem;
export type LoxoSeniorityLevel = LoxoReferenceItem;
export type LoxoFeeType = LoxoReferenceItem;

// LOXO Company payload
export interface LoxoCompanyPayload {
  company: {
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

// LOXO Company response
export interface LoxoCompanyResponse {
  id: number;
  name: string;
  [key: string]: unknown;
}

// LOXO Job Owner (from job response)
export interface LoxoJobOwner {
  id: number;
  position: number;
  name: string;
  email: string;
  phone: string | null;
  user_id: number;
  avatar_thumb_url: string;
  avatar_original_url: string;
  job_owner_type_id: number;
}

// LOXO Job Contact Email
export interface LoxoContactEmail {
  id: number;
  value: string;
  email_type_id: number;
}

// LOXO Job Contact Phone
export interface LoxoContactPhone {
  id: number;
  value: string;
  phone_type_id: number;
}

// LOXO Job Contact (from job response)
export interface LoxoJobContact {
  id: number;
  position: number;
  profile_picture_thumb_url: string;
  name: string;
  title: string;
  person_id: number;
  emails: LoxoContactEmail[];
  phones: LoxoContactPhone[];
  job_contact_type_id: number;
}

// LOXO Company in job response (embedded)
export interface LoxoJobCompany {
  id: number;
  name: string;
  hidden: boolean;
  logo_large_url: string;
  logo_thumb_url: string;
}

// LOXO Job payload (for creating/updating jobs)
export interface LoxoJobPayload {
  job: {
    // Required fields
    title: string;
    company_id: number;

    // Optional standard fields
    description?: string;
    published_name?: string;
    address?: string;
    city?: string;
    state_code?: string;
    zip?: string;
    country_code?: string;
    job_type_id?: number;
    job_status_id?: number;
    category_ids?: number[];
    seniority_level_ids?: number[];
    opened_at?: string;
    published?: boolean;
    published_end_date?: string;
    remote_work_allowed?: boolean;
    company_hidden?: boolean;
    
    // Compensation
    salary?: string;
    salary_min?: string;
    salary_max?: string;
    salary_type_id?: number;
    salary_currency_id?: number;
    bonus?: string;
    bonus_payment_type_id?: number;
    bonus_type_id?: number;
    equity?: string;
    equity_percent?: string;
    equity_type_id?: number;
    
    // Fee structure
    fee?: number;
    fee_type_id?: number;
    fee_currency_id?: number;
    
    // Internal
    internal_notes?: string;
    custom_text_1?: string;

    // Dynamic/Custom fields (agency-specific, prefixed with $)
    [key: `$${string}`]: string | number | boolean | undefined;
  };
}

// LOXO Job List Response (paginated)
export interface LoxoJobListResponse {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_count: number;
  results: LoxoJobResponse[];
}

// LOXO Job response (from GET)
export interface LoxoJobResponse {
  id: number;
  agency: {
    id: number;
    name: string;
  };
  title: string;
  published_name: string;
  macro_address: string | null;
  description?: string;
  description_text?: string;
  internal_notes?: string;
  
  // Company
  company: LoxoJobCompany;
  company_hidden: boolean;
  
  // Location
  address: string | null;
  city: string | null;
  state_code: string | null;
  zip: string | null;
  country_code: string | null;
  
  // People
  owners: LoxoJobOwner[];
  contacts: LoxoJobContact[];
  
  // Compensation
  salary: string | null;
  salary_min: string | null;
  salary_max: string | null;
  salary_type_id: number;
  salary_currency_id: number;
  bonus: string | null;
  bonus_payment_type_id: number | null;
  bonus_type_id: number | null;
  equity: string | null;
  equity_percent: string | null;
  equity_type_id: number | null;
  
  // Type & Status
  job_type: LoxoReferenceItem;
  status: LoxoReferenceItem;
  categories: LoxoReferenceItem[];
  category: LoxoReferenceItem | null;
  seniority_levels?: LoxoReferenceItem[];
  
  // Fee
  fee: number | null;
  fee_type_id: number | null;
  fee_currency_id: number | null;
  
  // Dates
  created_at: string;
  updated_at: string;
  opened_at: string;
  filled_at: string | null;
  published_at: string;
  published_end_date: string | null;
  
  // Publishing
  published: boolean;
  public_url: string;
  remote_work_allowed: boolean;
  
  // Custom fields
  custom_text_1: string | null;
  
  // Other
  [key: string]: unknown;
}

// LOXO Job Contact payload (for creating contacts)
export interface LoxoJobContactPayload {
  job_contact: {
    name: string;
    title?: string;
    person_id?: number;
    job_contact_type_id?: number;
    emails?: Array<{ value: string; email_type_id?: number }>;
    phones?: Array<{ value: string; phone_type_id?: number }>;
  };
}

// LOXO Job Contact response (same as LoxoJobContact)
export type LoxoJobContactResponse = LoxoJobContact;

// =============================================================================
// FIELD MAPPING TYPES
// =============================================================================

// Mapping configuration for transforming intake form to LOXO
export interface IntakeToLoxoMapping {
  // Standard field mappings
  standardFields: {
    intakeField: keyof HiringIntakeFormData;
    loxoField: string;
    transform?: (value: unknown) => unknown;
  }[];

  // Dynamic field mappings
  dynamicFields: {
    intakeField: keyof HiringIntakeFormData;
    loxoDynamicKey: string;
  }[];

  // Contact field mappings
  contactFields: {
    intakeField: string;
    loxoContactField: string;
  }[];
}

