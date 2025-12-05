import axios, { AxiosError } from 'axios';
import type { 
  FormData, 
  LoxoPersonResponse,
  LoxoJobPayload,
  LoxoJobResponse,
  LoxoJobListResponse,
  LoxoCompanyPayload,
  LoxoCompanyResponse,
  LoxoJobContactPayload,
  LoxoJobContactResponse,
  LoxoReferenceItem,
  HiringIntakeFormData,
  WorkArrangement,
} from '@/types';

const LOXO_API_BASE_URL = process.env.LOXO_API_BASE_URL || 'https://app.loxo.co/api';
const LOXO_AGENCY_SLUG = process.env.LOXO_AGENCY_SLUG || 'agencies/4134';
const LOXO_API_KEY = process.env.LOXO_API_KEY || '';

const loxoClient = axios.create({
  baseURL: `${LOXO_API_BASE_URL}/${LOXO_AGENCY_SLUG}`,
  headers: {
    'Authorization': `Bearer ${LOXO_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

interface LoxoPersonPayload {
  person: {
    name: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
    title?: string;
    company?: string;
    city?: string;
    state?: string;
    country?: string;
    description?: string;
    all_raw_tags?: string[];
    source_type_id?: number;
    compensation?: string;
    compensation_notes?: string;
  };
}

// Transform form data to Loxo API format
function transformFormDataToLoxo(data: FormData): LoxoPersonPayload {
  const person: LoxoPersonPayload['person'] = {
    name: data.name,
    email: data.email,
  };

  if (data.phone) person.phone = data.phone;
  if (data.linkedinUrl) person.linkedin_url = data.linkedinUrl;
  if (data.title) person.title = data.title;
  if (data.company) person.company = data.company;
  if (data.city) person.city = data.city;
  if (data.state) person.state = data.state;
  if (data.country) person.country = data.country;
  if (data.description) person.description = data.description;
  if (data.tags && data.tags.length > 0) person.all_raw_tags = data.tags;
  if (data.sourceTypeId) person.source_type_id = data.sourceTypeId;
  if (data.compensation) person.compensation = String(data.compensation);
  if (data.compensationNotes) person.compensation_notes = data.compensationNotes;

  return { person };
}

// Create a new person in Loxo (POST)
export async function createPerson(data: FormData): Promise<LoxoPersonResponse> {
  try {
    const payload = transformFormDataToLoxo(data);
    console.log('Creating person in Loxo:', payload);
    const response = await loxoClient.post<LoxoPersonResponse>('/people', payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (create):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Update an existing person in Loxo (PUT)
export async function updatePerson(loxoPersonId: number, data: FormData): Promise<LoxoPersonResponse> {
  try {
    const payload = transformFormDataToLoxo(data);
    console.log('Updating person in Loxo:', loxoPersonId, payload);
    const response = await loxoClient.put<LoxoPersonResponse>(`/people/${loxoPersonId}`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (update):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Get a person from Loxo by ID
export async function getPerson(loxoPersonId: number): Promise<LoxoPersonResponse | null> {
  try {
    const response = await loxoClient.get<LoxoPersonResponse>(`/people/${loxoPersonId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Intelligent sync: Create or Update based on whether loxoPersonId exists
export async function syncPersonToLoxo(
  data: FormData, 
  existingLoxoPersonId?: number | null
): Promise<{ action: 'created' | 'updated'; loxoPersonId: number }> {
  if (existingLoxoPersonId) {
    // Update existing person
    const response = await updatePerson(existingLoxoPersonId, data);
    return { action: 'updated', loxoPersonId: response.id };
  } else {
    // Create new person
    const response = await createPerson(data);
    return { action: 'created', loxoPersonId: response.id };
  }
}

// Get source types from Loxo (for dropdown)
export async function getSourceTypes(): Promise<Array<{ id: number; name: string }>> {
  try {
    const response = await loxoClient.get('/source_types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch source types:', error);
    return [];
  }
}

// =============================================================================
// REFERENCE DATA ENDPOINTS
// =============================================================================

// Get job types (Remote/Onsite/Hybrid)
export async function getJobTypes(): Promise<LoxoReferenceItem[]> {
  try {
    const response = await loxoClient.get('/job_types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job types:', error);
    return [];
  }
}

// Get job statuses
export async function getJobStatuses(): Promise<LoxoReferenceItem[]> {
  try {
    const response = await loxoClient.get('/job_statuses');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job statuses:', error);
    return [];
  }
}

// Get job categories (industries)
export async function getJobCategories(): Promise<LoxoReferenceItem[]> {
  try {
    const response = await loxoClient.get('/job_categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job categories:', error);
    return [];
  }
}

// Get seniority levels
export async function getSeniorityLevels(): Promise<LoxoReferenceItem[]> {
  try {
    const response = await loxoClient.get('/seniority_levels');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch seniority levels:', error);
    return [];
  }
}

// Get fee types
export async function getFeeTypes(): Promise<LoxoReferenceItem[]> {
  try {
    const response = await loxoClient.get('/fee_types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fee types:', error);
    return [];
  }
}

// Fetch all reference data at once
export async function getAllReferenceData(): Promise<{
  jobTypes: LoxoReferenceItem[];
  jobStatuses: LoxoReferenceItem[];
  jobCategories: LoxoReferenceItem[];
  seniorityLevels: LoxoReferenceItem[];
  feeTypes: LoxoReferenceItem[];
  sourceTypes: LoxoReferenceItem[];
}> {
  const [jobTypes, jobStatuses, jobCategories, seniorityLevels, feeTypes, sourceTypes] = 
    await Promise.all([
      getJobTypes(),
      getJobStatuses(),
      getJobCategories(),
      getSeniorityLevels(),
      getFeeTypes(),
      getSourceTypes(),
    ]);

  return { jobTypes, jobStatuses, jobCategories, seniorityLevels, feeTypes, sourceTypes };
}

// =============================================================================
// COMPANY ENDPOINTS
// =============================================================================

// Search for companies by name
export async function searchCompanies(query: string): Promise<LoxoCompanyResponse[]> {
  try {
    const response = await loxoClient.get('/companies', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Failed to search companies:', error);
    return [];
  }
}

// Create a new company
export async function createCompany(payload: LoxoCompanyPayload): Promise<LoxoCompanyResponse> {
  try {
    console.log('Creating company in Loxo:', payload);
    const response = await loxoClient.post<LoxoCompanyResponse>('/companies', payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (create company):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Get or create company (finds existing or creates new)
export async function getOrCreateCompany(
  companyName: string,
  companyData?: Partial<LoxoCompanyPayload['company']>
): Promise<LoxoCompanyResponse> {
  // Search for existing company
  const existingCompanies = await searchCompanies(companyName);
  
  // Find exact match (case-insensitive)
  const exactMatch = existingCompanies.find(
    c => c.name.toLowerCase() === companyName.toLowerCase()
  );
  
  if (exactMatch) {
    console.log('Found existing company:', exactMatch.id, exactMatch.name);
    return exactMatch;
  }
  
  // Create new company
  const payload: LoxoCompanyPayload = {
    company: {
      name: companyName,
      ...companyData,
    },
  };
  
  return createCompany(payload);
}

// =============================================================================
// JOB ENDPOINTS
// =============================================================================

// Get all jobs (paginated)
export async function getJobs(params?: { page?: number; per_page?: number; q?: string }): Promise<LoxoJobListResponse> {
  try {
    const response = await loxoClient.get<LoxoJobListResponse>('/jobs', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return { current_page: 1, total_pages: 0, per_page: 25, total_count: 0, results: [] };
  }
}

// Get a single job by ID
export async function getJob(jobId: number): Promise<LoxoJobResponse | null> {
  try {
    const response = await loxoClient.get<LoxoJobResponse>(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Create a new job
export async function createJob(payload: LoxoJobPayload): Promise<LoxoJobResponse> {
  try {
    console.log('Creating job in Loxo:', payload);
    const response = await loxoClient.post<LoxoJobResponse>('/jobs', payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (create job):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Update an existing job
export async function updateJob(jobId: number, payload: LoxoJobPayload): Promise<LoxoJobResponse> {
  try {
    console.log('Updating job in Loxo:', jobId, payload);
    const response = await loxoClient.put<LoxoJobResponse>(`/jobs/${jobId}`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (update job):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Delete a job
export async function deleteJob(jobId: number): Promise<void> {
  try {
    await loxoClient.delete(`/jobs/${jobId}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (delete job):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// =============================================================================
// JOB CONTACTS ENDPOINTS
// =============================================================================

// Add a contact to a job
export async function addJobContact(
  jobId: number, 
  payload: LoxoJobContactPayload
): Promise<LoxoJobContactResponse> {
  try {
    console.log('Adding contact to job:', jobId, payload);
    const response = await loxoClient.post<LoxoJobContactResponse>(
      `/jobs/${jobId}/contacts`, 
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Loxo API Error (add job contact):', error.response?.data);
      throw new Error(`Loxo API Error: ${message}`);
    }
    throw error;
  }
}

// Get contacts for a job
export async function getJobContacts(jobId: number): Promise<LoxoJobContactResponse[]> {
  try {
    const response = await loxoClient.get(`/jobs/${jobId}/contacts`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch job contacts:', error);
    return [];
  }
}

// =============================================================================
// HIRING INTAKE FORM TRANSFORMATION
// =============================================================================

// Map work arrangement to job type
function mapWorkArrangementToJobType(
  arrangement: WorkArrangement | undefined,
  jobTypes: LoxoReferenceItem[]
): number | undefined {
  if (!arrangement || !jobTypes.length) return undefined;
  
  const typeMap: Record<WorkArrangement, string[]> = {
    remote: ['remote', 'work from home', 'wfh'],
    onsite: ['onsite', 'on-site', 'in office', 'in-office'],
    hybrid: ['hybrid', 'flex', 'flexible'],
  };
  
  const searchTerms = typeMap[arrangement] || [];
  const match = jobTypes.find(jt => 
    searchTerms.some(term => jt.name.toLowerCase().includes(term))
  );
  
  return match?.id;
}

// Build job description from intake form data (public-facing description)
function buildJobDescription(data: HiringIntakeFormData): string {
  const sections: string[] = [];
  
  if (data.jobOverview) {
    sections.push(`<h2>Overview</h2>\n<p>${escapeHtml(data.jobOverview)}</p>`);
  }
  
  if (data.coreResponsibilities) {
    sections.push(`<h2>Core Responsibilities</h2>\n<p>${escapeHtml(data.coreResponsibilities)}</p>`);
  }
  
  if (data.requiredSkills?.length) {
    sections.push(`<h2>Required Skills</h2>\n<ul>${data.requiredSkills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`);
  }
  
  if (data.niceToHaveSkills?.length) {
    sections.push(`<h2>Nice-to-Have Skills</h2>\n<ul>${data.niceToHaveSkills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`);
  }
  
  if (data.industryExperience) {
    sections.push(`<h2>Industry Experience</h2>\n<p>${escapeHtml(data.industryExperience)}</p>`);
  }
  
  if (data.sampleCareerTrajectory) {
    sections.push(`<h2>Ideal Candidate Profile</h2>\n<p>${escapeHtml(data.sampleCareerTrajectory)}</p>`);
  }
  
  if (data.department) {
    sections.push(`<h2>Team/Department</h2>\n<p>${escapeHtml(data.department)}</p>`);
  }
  
  // Compensation summary (public)
  if (data.compensation?.salaryRange) {
    sections.push(`<h2>Compensation</h2>\n<p>Salary Range: ${escapeHtml(data.compensation.salaryRange)}</p>`);
  }
  
  return sections.join('\n');
}

// Helper to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');
}

// Build tags array from intake form data (prepared for future use)
function _buildTags(data: HiringIntakeFormData): string[] {
  const tags: string[] = [];
  
  // Required skills as primary tags
  if (data.requiredSkills?.length) {
    tags.push(...data.requiredSkills);
  }
  
  // Nice-to-have with prefix
  if (data.niceToHaveSkills?.length) {
    tags.push(...data.niceToHaveSkills.map(s => `nice-to-have:${s}`));
  }
  
  // Industry as tag
  if (data.industryExperience) {
    tags.push(`industry:${data.industryExperience}`);
  }
  
  // Experience level as tag
  if (data.experienceLevel) {
    tags.push(`level:${data.experienceLevel}`);
  }
  
  // Work arrangement as tag
  if (data.workArrangement) {
    tags.push(`arrangement:${data.workArrangement}`);
  }
  
  return tags;
}

// Transform hiring intake form data to LOXO job payload
export function transformIntakeToJobPayload(
  data: HiringIntakeFormData,
  companyId: number,
  referenceData?: {
    jobTypes?: LoxoReferenceItem[];
    seniorityLevels?: LoxoReferenceItem[];
    jobCategories?: LoxoReferenceItem[];
  }
): LoxoJobPayload {
  const { address } = data.clientCompany;
  
  // Parse salary range if available
  let salaryMin: string | undefined;
  let salaryMax: string | undefined;
  if (data.compensation?.salaryRange) {
    // Parse "$100K to $200K" format
    const match = data.compensation.salaryRange.match(/\$?([\d,]+)K?\s*(?:to|-)\s*\$?([\d,]+)K?/i);
    if (match) {
      salaryMin = String(parseInt(match[1].replace(/,/g, '')) * (match[1].includes('K') || data.compensation.salaryRange.includes('K') ? 1000 : 1));
      salaryMax = String(parseInt(match[2].replace(/,/g, '')) * (match[2].includes('K') || data.compensation.salaryRange.includes('K') ? 1000 : 1));
    }
  } else if (data.compensation?.salaryMin) {
    salaryMin = String(data.compensation.salaryMin);
    salaryMax = data.compensation.salaryMax ? String(data.compensation.salaryMax) : undefined;
  }
  
  const payload: LoxoJobPayload = {
    job: {
      // Required fields
      title: data.jobTitle,
      company_id: companyId,
      
      // Description (HTML - public facing)
      description: buildJobDescription(data),
      
      // Location fields (using correct LOXO field names)
      address: address.street,
      city: address.city,
      state_code: address.state, // LOXO uses state_code, not state
      zip: address.zip,
      country_code: address.country || 'US', // LOXO uses country_code
      
      // Map work arrangement to job type if reference data available
      job_type_id: mapWorkArrangementToJobType(
        data.workArrangement, 
        referenceData?.jobTypes || []
      ),
      
      // Remote work flag
      remote_work_allowed: data.workArrangement === 'remote',
      
      // Start date (opened_at is the LOXO field for job open date)
      opened_at: data.targetStartDate !== 'ASAP' ? data.targetStartDate : undefined,
      
      // Compensation (salary is a string in LOXO)
      salary: data.compensation?.salaryRange || (salaryMin ? `${salaryMin} - ${salaryMax}` : undefined),
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_type_id: data.compensation?.salaryType === 'hourly' ? 2 : 1, // 1=Annual, 2=Hourly
      
      // Internal notes for all the extended intake form data
      internal_notes: buildInternalNotes(data),
      
      // Custom text field for industry
      custom_text_1: data.industryExperience,
    },
  };
  
  // Remove undefined fields
  Object.keys(payload.job).forEach(key => {
    const value = payload.job[key as keyof typeof payload.job];
    if (value === undefined || value === null || value === '') {
      delete payload.job[key as keyof typeof payload.job];
    }
  });
  
  return payload;
}

// Build internal notes from intake form data (comprehensive - all internal fields)
function buildInternalNotes(data: HiringIntakeFormData): string {
  const sections: string[] = [];
  
  // ==========================================================================
  // INTAKE MEETING INFO
  // ==========================================================================
  const meetingInfo: string[] = [];
  if (data.meetingDate) {
    meetingInfo.push(`<p><strong>Meeting Date:</strong> ${escapeHtml(data.meetingDate)}</p>`);
  }
  if (data.clientCompany.contactName) {
    meetingInfo.push(`<p><strong>Client Contact:</strong> ${escapeHtml(data.clientCompany.contactName)}</p>`);
  }
  if (data.clientCompany.feeStructure.rawString) {
    meetingInfo.push(`<p><strong>Fee Structure:</strong> ${escapeHtml(data.clientCompany.feeStructure.rawString)}</p>`);
  }
  if (meetingInfo.length) {
    sections.push(`<h3>📋 Intake Meeting</h3>${meetingInfo.join('')}`);
  }
  
  // ==========================================================================
  // BACKGROUND INFO
  // ==========================================================================
  const backgroundInfo: string[] = [];
  if (data.directManager) {
    backgroundInfo.push(`<p><strong>Direct Manager:</strong> ${escapeHtml(data.directManager)}</p>`);
  }
  if (data.experienceLevel) {
    backgroundInfo.push(`<p><strong>Experience Level:</strong> ${escapeHtml(data.experienceLevel)}</p>`);
  }
  if (data.workArrangementDetails) {
    backgroundInfo.push(`<p><strong>Work Arrangement:</strong> ${escapeHtml(data.workArrangementDetails)}</p>`);
  }
  if (data.reasonForHire) {
    backgroundInfo.push(`<p><strong>Reason for Hire:</strong> ${escapeHtml(data.reasonForHire)}</p>`);
  }
  if (data.successCriteria) {
    backgroundInfo.push(`<p><strong>Success Criteria:</strong> ${escapeHtml(data.successCriteria)}</p>`);
  }
  if (data.department) {
    backgroundInfo.push(`<p><strong>Department:</strong> ${escapeHtml(data.department)}</p>`);
  }
  if (data.sampleCareerTrajectory) {
    backgroundInfo.push(`<p><strong>Ideal Candidate:</strong> ${escapeHtml(data.sampleCareerTrajectory)}</p>`);
  }
  if (data.impactIfNotFilled) {
    backgroundInfo.push(`<p><strong>Impact if Not Filled:</strong> ${escapeHtml(data.impactIfNotFilled)}</p>`);
  }
  if (data.impactIfFilled) {
    backgroundInfo.push(`<p><strong>Impact if Filled:</strong> ${escapeHtml(data.impactIfFilled)}</p>`);
  }
  if (backgroundInfo.length) {
    sections.push(`<h3>📝 Background</h3>${backgroundInfo.join('')}`);
  }
  
  // ==========================================================================
  // SOURCING CRITERIA
  // ==========================================================================
  const sourcingInfo: string[] = [];
  if (data.targetCompanies?.length) {
    sourcingInfo.push(`<p><strong>Target Companies:</strong> ${data.targetCompanies.map(c => escapeHtml(c)).join(', ')}</p>`);
  }
  if (data.sourcingCriteria?.employees) {
    sourcingInfo.push(`<p><strong>Employees:</strong> ${escapeHtml(data.sourcingCriteria.employees)}</p>`);
  }
  if (data.sourcingCriteria?.competitors) {
    sourcingInfo.push(`<p><strong>Competitors:</strong> ${escapeHtml(data.sourcingCriteria.competitors)}</p>`);
  }
  if (data.sourcingCriteria?.personalityTraits) {
    sourcingInfo.push(`<p><strong>Personality Traits/Core Values:</strong> ${escapeHtml(data.sourcingCriteria.personalityTraits)}</p>`);
  }
  if (data.sourcingCriteria?.doNotTouch) {
    sourcingInfo.push(`<p><strong>Do Not Touch:</strong> ${escapeHtml(data.sourcingCriteria.doNotTouch)}</p>`);
  }
  if (data.sourcingCriteria?.discProfile) {
    sourcingInfo.push(`<p><strong>DISC/IP Profile:</strong> ${escapeHtml(data.sourcingCriteria.discProfile)}</p>`);
  }
  if (data.sourcingCriteria?.internalCandidates) {
    sourcingInfo.push(`<p><strong>Internal Candidates:</strong> ${escapeHtml(data.sourcingCriteria.internalCandidates)}</p>`);
  }
  if (data.sourcingCriteria?.notes) {
    sourcingInfo.push(`<p><strong>Sourcing Notes:</strong> ${escapeHtml(data.sourcingCriteria.notes)}</p>`);
  }
  if (sourcingInfo.length) {
    sections.push(`<h3>🎯 Sourcing Criteria</h3>${sourcingInfo.join('')}`);
  }
  
  // ==========================================================================
  // COMPENSATION
  // ==========================================================================
  const compInfo: string[] = [];
  if (data.compensation?.salaryRange) {
    compInfo.push(`<p><strong>Salary Range:</strong> ${escapeHtml(data.compensation.salaryRange)}</p>`);
  }
  if (data.compensation?.bonus) {
    compInfo.push(`<p><strong>Bonus:</strong> ${escapeHtml(data.compensation.bonus)}</p>`);
  }
  if (data.compensation?.benefits) {
    compInfo.push(`<p><strong>Benefits:</strong> ${escapeHtml(data.compensation.benefits)}</p>`);
  }
  if (data.compensation?.notes) {
    compInfo.push(`<p><strong>Comp Notes:</strong> ${escapeHtml(data.compensation.notes)}</p>`);
  }
  if (compInfo.length) {
    sections.push(`<h3>💰 Compensation</h3>${compInfo.join('')}`);
  }
  
  // ==========================================================================
  // RECRUITING PROCESS
  // ==========================================================================
  const recruitInfo: string[] = [];
  if (data.recruitingProcess?.otherSearchFirms) {
    recruitInfo.push(`<p><strong>Other Search Firms:</strong> ${escapeHtml(data.recruitingProcess.otherSearchFirms)}</p>`);
  }
  if (data.recruitingProcess?.mustHaveInterviewers) {
    recruitInfo.push(`<p><strong>Must-Have Interviewers:</strong> ${escapeHtml(data.recruitingProcess.mustHaveInterviewers)}</p>`);
  }
  if (data.recruitingProcess?.notes) {
    recruitInfo.push(`<p><strong>Recruiting Notes:</strong> ${escapeHtml(data.recruitingProcess.notes)}</p>`);
  }
  if (recruitInfo.length) {
    sections.push(`<h3>🔍 Recruiting Process</h3>${recruitInfo.join('')}`);
  }
  
  // ==========================================================================
  // TIMELINE
  // ==========================================================================
  const timelineInfo: string[] = [];
  if (data.timeline?.keyMilestones) {
    timelineInfo.push(`<p><strong>Key Milestones:</strong> ${escapeHtml(data.timeline.keyMilestones)}</p>`);
  }
  if (data.timeline?.cadenceOfCheckIns) {
    timelineInfo.push(`<p><strong>Check-In Cadence:</strong> ${escapeHtml(data.timeline.cadenceOfCheckIns)}</p>`);
  }
  if (data.timeline?.candidateSatisfactionSurvey) {
    timelineInfo.push(`<p><strong>Candidate Survey:</strong> ${escapeHtml(data.timeline.candidateSatisfactionSurvey)}</p>`);
  }
  if (data.timeline?.targetNPS) {
    timelineInfo.push(`<p><strong>Target NPS:</strong> ${escapeHtml(data.timeline.targetNPS)}</p>`);
  }
  if (data.timeline?.notes) {
    timelineInfo.push(`<p><strong>Timeline Notes:</strong> ${escapeHtml(data.timeline.notes)}</p>`);
  }
  if (timelineInfo.length) {
    sections.push(`<h3>📅 Timeline</h3>${timelineInfo.join('')}`);
  }
  
  // ==========================================================================
  // WORKING TOGETHER
  // ==========================================================================
  const workingInfo: string[] = [];
  if (data.workingTogether?.levelOfPriority) {
    workingInfo.push(`<p><strong>Priority Level:</strong> ${data.workingTogether.levelOfPriority}/5</p>`);
  }
  if (data.workingTogether?.expectedTurnaroundTime) {
    workingInfo.push(`<p><strong>Expected Turnaround:</strong> ${escapeHtml(data.workingTogether.expectedTurnaroundTime)}</p>`);
  }
  if (data.workingTogether?.feedbackExpectations) {
    workingInfo.push(`<p><strong>Feedback Expectations:</strong> ${escapeHtml(data.workingTogether.feedbackExpectations)}</p>`);
  }
  if (data.workingTogether?.clientTimePercentage) {
    workingInfo.push(`<p><strong>Client Time %:</strong> ${escapeHtml(data.workingTogether.clientTimePercentage)}</p>`);
  }
  if (data.workingTogether?.preferredStatusMethod) {
    workingInfo.push(`<p><strong>Preferred Status Method:</strong> ${escapeHtml(data.workingTogether.preferredStatusMethod)}</p>`);
  }
  if (data.workingTogether?.clientExpectationForCandidates) {
    workingInfo.push(`<p><strong>Candidate Expectations:</strong> ${escapeHtml(data.workingTogether.clientExpectationForCandidates)}</p>`);
  }
  if (data.workingTogether?.notes) {
    workingInfo.push(`<p><strong>Working Together Notes:</strong> ${escapeHtml(data.workingTogether.notes)}</p>`);
  }
  if (workingInfo.length) {
    sections.push(`<h3>🤝 Working Together</h3>${workingInfo.join('')}`);
  }
  
  // ==========================================================================
  // NEXT STEPS
  // ==========================================================================
  if (data.immediateActionItems) {
    sections.push(`<h3>⚡ Next Steps</h3><p><strong>Immediate Action Items:</strong> ${escapeHtml(data.immediateActionItems)}</p>`);
  }
  
  // ==========================================================================
  // COMPLETION (Internal)
  // ==========================================================================
  const completionInfo: string[] = [];
  if (data.completion?.completionDate) {
    completionInfo.push(`<p><strong>Completion Date:</strong> ${escapeHtml(data.completion.completionDate)}</p>`);
  }
  if (data.completion?.whatWorked) {
    completionInfo.push(`<p><strong>What Worked:</strong> ${escapeHtml(data.completion.whatWorked)}</p>`);
  }
  if (data.completion?.lessonsLearned) {
    completionInfo.push(`<p><strong>Lessons Learned:</strong> ${escapeHtml(data.completion.lessonsLearned)}</p>`);
  }
  if (data.completion?.whatDidNotWork) {
    completionInfo.push(`<p><strong>What Did Not Work:</strong> ${escapeHtml(data.completion.whatDidNotWork)}</p>`);
  }
  if (data.completion?.actionsForImprovement) {
    completionInfo.push(`<p><strong>Actions for Improvement:</strong> ${escapeHtml(data.completion.actionsForImprovement)}</p>`);
  }
  if (data.completion?.notes) {
    completionInfo.push(`<p><strong>Completion Notes:</strong> ${escapeHtml(data.completion.notes)}</p>`);
  }
  if (completionInfo.length) {
    sections.push(`<h3>✅ Completion</h3>${completionInfo.join('')}`);
  }
  
  return sections.join('\n\n');
}

// Build job contact payload from intake form
export function buildJobContactPayload(
  contact: { name: string; email?: string; mobilePhone?: string; officePhone?: string; notes?: string },
  contactTypeId?: number
): LoxoJobContactPayload {
  const emails: Array<{ value: string; email_type_id?: number }> = [];
  const phones: Array<{ value: string; phone_type_id?: number }> = [];
  
  if (contact.email) {
    emails.push({ value: contact.email });
  }
  
  if (contact.mobilePhone) {
    phones.push({ value: contact.mobilePhone, phone_type_id: 1 }); // 1 = Mobile
  }
  
  if (contact.officePhone) {
    phones.push({ value: contact.officePhone, phone_type_id: 2 }); // 2 = Office
  }
  
  return {
    job_contact: {
      name: contact.name,
      title: contact.notes, // Use notes as title if no title provided
      emails: emails.length > 0 ? emails : undefined,
      phones: phones.length > 0 ? phones : undefined,
      job_contact_type_id: contactTypeId,
    },
  };
}

// =============================================================================
// COMPLETE SYNC FUNCTION
// =============================================================================

// Sync hiring intake form to LOXO (creates company, job, and contacts)
export async function syncHiringIntakeToLoxo(
  data: HiringIntakeFormData,
  existingJobId?: number | null,
  existingCompanyId?: number | null
): Promise<{
  action: 'created' | 'updated';
  jobId: number;
  companyId: number;
}> {
  // Fetch reference data for mapping
  const referenceData = await getAllReferenceData();
  
  // Get or create company
  let companyId: number;
  if (existingCompanyId) {
    companyId = existingCompanyId;
  } else {
    const company = await getOrCreateCompany(
      data.clientCompany.name,
      {
        address: data.clientCompany.address.street,
        city: data.clientCompany.address.city,
        state: data.clientCompany.address.state,
        zip: data.clientCompany.address.zip,
        country: data.clientCompany.address.country,
      }
    );
    companyId = company.id;
  }
  
  // Transform intake data to job payload
  const jobPayload = transformIntakeToJobPayload(data, companyId, {
    jobTypes: referenceData.jobTypes,
    seniorityLevels: referenceData.seniorityLevels,
    jobCategories: referenceData.jobCategories,
  });
  
  // Create or update job
  let job: LoxoJobResponse;
  let action: 'created' | 'updated';
  
  if (existingJobId) {
    job = await updateJob(existingJobId, jobPayload);
    action = 'updated';
  } else {
    job = await createJob(jobPayload);
    action = 'created';
    
    // Add contacts only for new jobs
    for (const contact of data.clientCompany.contacts) {
      try {
        const contactPayload = buildJobContactPayload(contact);
        await addJobContact(job.id, contactPayload);
      } catch (error) {
        console.error('Failed to add job contact:', error);
        // Continue even if contact addition fails
      }
    }
  }
  
  return {
    action,
    jobId: job.id,
    companyId,
  };
}
