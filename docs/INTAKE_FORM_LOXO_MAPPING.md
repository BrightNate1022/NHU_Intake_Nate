# Hiring Intake Form to LOXO Jobs API Field Mapping

## Overview

This document maps the Hiring Intake Form fields to LOXO's Jobs API endpoints. The intake form is used to capture job requirements during client meetings, which then need to be synced to LOXO for candidate management.

## Form Template Structure

The Hiring Intake Form has the following sections:
1. **Client/Company Information** - Details about the hiring company
2. **Job Background** - Core job requirements and context
3. **Skills & Requirements** - Technical and soft skills needed
4. **Impact Assessment** - Business context for the role

---

## Complete Field Extraction (All 4 Pages)

### Section 1: Client/Company Information

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Client Company | string | Stone, Glass & Connolly, LLP | Yes |
| Client Name | string | Andrew D. Stone | Yes |
| Address (Street) | string | 18001 Old Cutler Road – Suite 457 | No |
| Address (City) | string | Palmetto Bay | No |
| Address (State) | string | FL | No |
| Address (Zip) | string | 33157 | No |
| Mobile Phone | string | 305.794.2285 | No |
| Office Phone | string | 305.670.5044 | No |
| E-Mail | string | astone@sgc-attorneys.com | Yes |
| Meeting Date | date | 8/22/2025 | Yes |
| Client Contact | string | Marko/Andrew HAS 4 Daughters! | Yes |
| Fee Structure | string | 20/22.5/25 Hire/45/90/135 $3500/$5500 | No |

### Section 2: Background

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Job Title | string | Premises Liability Attorney 3+ Years | Yes |
| Target Companies | string[] | Luks, Cole Scott, Quintairos, Boyd | No |
| Work Arrangement | string | Hybrid- 3 days in ofc for Assoc. Remote for a senior Atty. | No |
| Target Start Date | string | ASAP | No |
| Level (Entry, Senior, Etc.) | string | 3 yr. To 20 yrs experience | No |
| Reason for Hire | text | 8,000 files in the queue needs passionate litigators... | No |
| Direct Manager | string | Reports to Andrew | No |
| What does Success Look Like? | text | It is clear to Mr. Stone early on who will work out... | No |
| Department | string | 10 employees, 2 attorneys, 4 paralegals | No |
| Job Overview | text | 5+ years of experience in litigation... $200/hour... | Yes |
| Core Responsibilities/Competency | text | Writes very well, will provide a perfect summary judgment... | Yes |
| Industry Experience Necessary? | text | (blank or details) | No |
| Required Skills | string[] | Passion for litigating, knows insurance defense | Yes |
| Nice-To-Have Skills | string[] | (optional skills) | No |
| Sample Career Trajectory | text | 2-5 years with another insurance defense firm... | No |
| Impact if Not Filled | text | (business impact) | No |
| Impact if Filled | text | (business benefit) | No |

### Section 3: Job Responsibilities/Skills - Company Overview/Sourcing Criteria

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Target companies | string[] | Luks, Cole Scott, Quintairos, Boyd | No |
| Employees | text | 10 employees Candidate will be reporting and paid by STONE PA. Andrew + 2 attorneys | No |
| Competitors | text | (competitor companies) | No |
| Personality traits (EQ/Core Values) | text | Coachable, dependable, takes pride in QUALITY of their work... | No |
| Do not touch | text | None | No |
| DISC/IP desired profile | text | (DISC profile details) | No |
| Any internal candidates to consider? | text | (internal candidates) | No |
| Notes | text | (additional notes) | No |

### Section 4: Compensation

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Range | string | $100K to $200K | No |
| Bonus | text | $401k 3%, profit sharing share 3%. 100% paid health after a year. 100% covered health insurance | No |
| Notes | text | (additional comp notes) | No |

### Section 5: Recruiting/Interview Process

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Are there other Search Firms working on this assignment? | text | (yes/no + details) | No |
| Must-have Client interviewers | text | (required interviewers) | No |
| Notes | text | (interview process notes) | No |

### Section 6: Timeline

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Key Milestones and Timing | text | (milestone details) | No |
| Candidate Satisfaction Survey Required | text | (survey requirements) | No |
| Cadence of Check-Ins | text | (check-in frequency) | No |
| Target NPS | text | (NPS target) | No |
| Notes | text | (timeline notes) | No |

### Section 7: Working Together

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Level of priority (1-5) | number | 5 | No |
| Expected turnaround response time | string | 2 day max. | No |
| Feedback expectations (quality and timeline) | text | (feedback details) | No |
| Percentage of time Client is willing to spend | text | (time commitment) | No |
| Preferred method of delivering status updates | text | meetings, emails, phone calls, texts, etc. | No |
| WHAT IS THE CLIENT EXPECTATION TO RECEIVE candidates? | text | (candidate expectations) | No |
| Notes | text | (working together notes) | No |

### Section 8: Next Steps

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Immediate action items | text | (action items) | No |

### Section 9: Completion (Internal Use Only)

| Form Field | Data Type | Example | Required |
|------------|-----------|---------|----------|
| Completion Date | date | (date) | No |
| What Worked | text | (success notes) | No |
| Lessons Learned | text | (learnings) | No |
| What Did Not Work | text | (failure notes) | No |
| Actions for Improvement | text | (improvement items) | No |
| Notes | text | (completion notes) | No |

---

## LOXO Jobs API Endpoints

Based on the LOXO API documentation:

### Core Endpoints
- `POST /{agency_slug}/jobs` - Create a new job
- `GET /{agency_slug}/jobs` - List all jobs
- `GET /{agency_slug}/jobs/{id}` - Get a specific job
- `PUT /{agency_slug}/jobs/{id}` - Update a job
- `DELETE /{agency_slug}/jobs/{id}` - Delete a job

### Related Endpoints
- `POST /{agency_slug}/jobs/{job_id}/contacts` - Add job contacts
- `GET /{agency_slug}/jobs/{job_id}/candidates` - Get candidates for job
- `POST /{agency_slug}/jobs/{job_id}/apply` - Apply candidate to job

### Reference Data Endpoints
- `GET /{agency_slug}/job_types` - Get job types (Remote/Onsite/Hybrid)
- `GET /{agency_slug}/job_statuses` - Get job statuses
- `GET /{agency_slug}/job_categories` - Get job categories/industries
- `GET /{agency_slug}/seniority_levels` - Get seniority levels
- `GET /{agency_slug}/fee_types` - Get fee structure types

---

## Field Mapping: Intake Form → LOXO Jobs API

> **Verified against actual LOXO API responses on 2024-12-04**

### Direct Mappings (Standard LOXO Fields)

| Intake Form Field | LOXO API Parameter | Type | Notes |
|-------------------|-------------------|------|-------|
| Job Title | `job[title]` | string | **Required** |
| Job Overview + Core Responsibilities | `job[description]` | HTML string | Rich text/HTML |
| (from Company lookup) | `job[company_id]` | number | Must create/find Company first |
| Street Address | `job[address]` | string | Street address |
| City | `job[city]` | string | City name |
| State | `job[state_code]` | string | State code (NOT `state`) |
| Zip | `job[zip]` | string | Postal code |
| Country | `job[country_code]` | string | Country code (default: "US") |
| Work Arrangement | `job[job_type_id]` | number | Lookup from `/job_types` |
| Work Arrangement (remote) | `job[remote_work_allowed]` | boolean | true if remote |
| Target Start Date | `job[opened_at]` | ISO date | When job opened |
| Industry | `job[category_ids][]` | number[] | Lookup from `/job_categories` |

### Compensation Mappings

| Intake Form Field | LOXO API Parameter | Type | Notes |
|-------------------|-------------------|------|-------|
| Salary/Rate | `job[salary]` | string | Note: STRING not number! |
| Min Salary | `job[salary_min]` | string | String format |
| Max Salary | `job[salary_max]` | string | String format |
| Compensation Type | `job[salary_type_id]` | number | 1=Annual, 2=Hourly |
| Currency | `job[salary_currency_id]` | number | 1=USD |
| Fee Amount | `job[fee]` | number | Placement fee |
| Fee Type | `job[fee_type_id]` | number | 1=Percentage, 2=Flat, 3=Hourly |

### Job Contacts Mapping (via `/jobs/{job_id}/contacts`)

| Intake Form Field | LOXO API Parameter | Type | Notes |
|-------------------|-------------------|------|-------|
| Contact Name | `job_contact[name]` | string | Primary contact |
| Contact Title | `job_contact[title]` | string | Job title |
| Email(s) | `job_contact[emails][]` | array | `{value, email_type_id}` |
| Phone(s) | `job_contact[phones][]` | array | `{value, phone_type_id}` |
| Contact Type | `job_contact[job_contact_type_id]` | number | Contact type ID |

### Internal Notes Mapping

Extended intake form fields are stored in `job[internal_notes]` as HTML:

| Intake Form Field | Stored As |
|-------------------|-----------|
| Meeting Date | `<p><strong>Intake Meeting Date:</strong> ...</p>` |
| Direct Manager | `<p><strong>Direct Manager:</strong> ...</p>` |
| Target Companies | `<p><strong>Target Companies:</strong> ...</p>` |
| Reason for Hire | `<p><strong>Reason for Hire:</strong> ...</p>` |
| Success Criteria | `<p><strong>Success Criteria:</strong> ...</p>` |
| Department | `<p><strong>Department:</strong> ...</p>` |
| Experience Level | `<p><strong>Experience Level:</strong> ...</p>` |
| Work Arrangement Details | `<p><strong>Work Arrangement Details:</strong> ...</p>` |
| Career Trajectory | `<p><strong>Ideal Candidate Profile:</strong> ...</p>` |
| Impact if Not Filled | `<p><strong>Impact if Not Filled:</strong> ...</p>` |
| Impact if Filled | `<p><strong>Impact if Filled:</strong> ...</p>` |
| Fee Structure | `<p><strong>Fee Structure:</strong> ...</p>` |

### Custom Text Field

| Intake Form Field | LOXO API Parameter | Notes |
|-------------------|-------------------|-------|
| Industry Experience | `job[custom_text_1]` | Agency custom field |

---

## Implementation Notes

### 1. Company Creation/Lookup Flow

Before creating a job, the company must exist in LOXO:

```typescript
// 1. Search for existing company
const companies = await loxoClient.get('/companies', { q: clientCompany });

// 2. If not found, create company
if (!companies.length) {
  const company = await loxoClient.post('/companies', {
    company: {
      name: clientCompany,
      address: streetAddress,
      city: city,
      state: state,
      zip: zip,
    }
  });
  companyId = company.id;
} else {
  companyId = companies[0].id;
}
```

### 2. Job Creation Payload Structure

```typescript
interface LoxoJobPayload {
  job: {
    // Required
    title: string;
    company_id: number;
    
    // Optional Standard Fields
    description?: string;
    location?: string;
    job_type_id?: number;
    job_status_id?: number;
    job_category_id?: number;
    seniority_level_id?: number;
    start_date?: string;
    salary?: number;
    salary_type_id?: number;
    fee_percent?: number;
    fee_type_id?: number;
    all_raw_tags?: string[];
    
    // Dynamic Fields (agency-specific)
    $target_companies?: string;
    $reason_for_hire?: string;
    $success_criteria?: string;
    $department?: string;
    $ideal_candidate?: string;
    $impact_open?: string;
    $impact_filled?: string;
    $intake_meeting_date?: string;
  };
}
```

### 3. Description Field Composition

The `description` field should be a rich HTML/Markdown composition:

```typescript
function buildJobDescription(formData: IntakeFormData): string {
  return `
## Overview
${formData.jobOverview}

## Core Responsibilities
${formData.coreResponsibilities}

## Required Skills
${formData.requiredSkills.map(s => `- ${s}`).join('\n')}

## Nice-to-Have Skills
${formData.niceToHaveSkills?.map(s => `- ${s}`).join('\n') || 'None specified'}

## Industry Experience
${formData.industryExperience || 'Not specified'}

## Success Criteria
${formData.successCriteria}

## Ideal Candidate Profile
${formData.careerTrajectory}
  `.trim();
}
```

### 4. Tags Array Composition

```typescript
function buildTags(formData: IntakeFormData): string[] {
  const tags: string[] = [];
  
  // Required skills as primary tags
  tags.push(...formData.requiredSkills);
  
  // Nice-to-have with prefix
  if (formData.niceToHaveSkills) {
    tags.push(...formData.niceToHaveSkills.map(s => `nice-to-have:${s}`));
  }
  
  // Industry as tag
  if (formData.industry) {
    tags.push(`industry:${formData.industry}`);
  }
  
  // Experience level as tag
  if (formData.level) {
    tags.push(`level:${formData.level}`);
  }
  
  return tags;
}
```

---

## Reference Data Mappings

### Job Types (Work Arrangement)

| Intake Value | LOXO job_type_id | Notes |
|--------------|------------------|-------|
| Remote | 1* | Verify via `/job_types` |
| Onsite | 2* | Verify via `/job_types` |
| Hybrid | 3* | Verify via `/job_types` |

*IDs are placeholder - fetch actual IDs from `/job_types` endpoint

### Seniority Levels

| Intake Value | LOXO seniority_level_id |
|--------------|------------------------|
| Entry Level | Lookup from `/seniority_levels` |
| Junior (1-3 years) | Lookup from `/seniority_levels` |
| Mid-Level (3-5 years) | Lookup from `/seniority_levels` |
| Senior (5-10 years) | Lookup from `/seniority_levels` |
| Lead/Principal (10+ years) | Lookup from `/seniority_levels` |

---

## Next Steps

1. **Verify API Access** - Test LOXO API credentials with current agency slug
2. **Fetch Reference Data** - Cache job_types, seniority_levels, fee_types, job_categories
3. **Implement Company Sync** - Create company lookup/creation flow
4. **Build Job Transformer** - Transform intake form data to LOXO job payload
5. **Add Contact Sync** - Create job contacts after job creation
6. **Test End-to-End** - Validate complete intake → LOXO flow

