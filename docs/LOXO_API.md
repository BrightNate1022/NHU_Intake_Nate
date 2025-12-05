# Loxo API Documentation

## Overview

Loxo is a Talent Intelligence Platform that provides an API for managing recruitment workflows, including candidate management, job postings, company data, and more. This document covers the API endpoints relevant to the HireU Intake Form application.

## Authentication

All endpoints use **Bearer Token Authentication**. The API key should be included in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

### Configuration

```
Base URL: https://app.loxo.co/api
Agency Slug: now-hiring-you-llc
API Key: ccbb77facc3cf6482bfac9bec96d1efa12347c28281efd4e5f5371aa4d75ec30459c606d8b5b151f92f5e3bceed137d3b0ac6b6181c101fb528ac06f8ad227e53b3c6d77c47c6f56093da041fb4473cc242d8232ac436ffa1fccc4baee93296ec8c1ebbc69f2927524e33102f9ad6b1590064bc3585f4b6377044b29fd482689
```

> **Note**: The agency slug is found in LOXO Settings, NOT from the browser URL (which shows `agencies/4134`). The correct slug format is a hyphenated name like `now-hiring-you-llc`.

---

## Core Endpoints

### People (Candidates)

#### POST /{agency_slug}/people

Creates a new person/candidate record in Loxo.

**Endpoint:** `POST https://app.loxo.co/api/{agency_slug}/people`

**Headers:**
```
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `person[profile_picture]` | file | No | Profile picture of the person |
| `person[name]` | string | Yes | Full name of the person |
| `person[description]` | string | No | Description/bio |
| `person[location]` | string | No | General location |
| `person[address]` | string | No | Street address |
| `person[city]` | string | No | City |
| `person[state]` | string | No | State/Province |
| `person[zip]` | string | No | ZIP/Postal code |
| `person[country]` | string | No | Country |
| `person[person_global_status_id]` | integer | No | Status ID |
| `person[source_type_id]` | integer | No | Source type ID |
| `person[blocked]` | boolean | No | Whether person is blocked |
| `person[blocked_until]` | string | No | Date until blocked |
| `person[title]` | string | No | Job title |
| `person[company]` | string | No | Current company |
| `person[email]` | string | Yes | Primary email |
| `person[emails][]` | array | No | Additional emails |
| `person[phone]` | string | No | Primary phone |
| `person[phones][]` | array | No | Additional phones |
| `person[linkedin_url]` | string | No | LinkedIn profile URL |
| `person[website]` | string | No | Personal website |
| `person[resume]` | file | No | Resume file |
| `person[resume_skip_parse]` | boolean | No | Skip resume parsing |
| `person[document]` | file | No | Additional document |
| `person[all_raw_tags][]` | array | No | Tags for the person |
| `person[person_type_id]` | integer | No | Person type ID |
| `person[candidates][]` | array | No | Candidate associations |
| `person[list_ids][]` | array | No | List memberships |
| `person[diversity_type_ids][]` | array | No | Diversity type IDs |
| `person[compensation]` | string | No | Compensation info |
| `person[compensation_notes]` | string | No | Compensation notes |
| `person[salary]` | number | No | Salary amount |
| `person[salary_type_id]` | integer | No | Salary type ID |
| `person[compensation_currency_id]` | integer | No | Currency ID |
| `person[bonus]` | number | No | Bonus amount |
| `person[bonus_type_id]` | integer | No | Bonus type ID |
| `person[bonus_payment_type_id]` | integer | No | Bonus payment type ID |
| `person[equity]` | string | No | Equity info |
| `person[equity_type_id]` | integer | No | Equity type ID |
| `person[owned_by_id]` | integer | No | Owner user ID |
| `person[$dynamic_field_key]` | any | No | Dynamic field values |

**Example Request:**
```json
{
  "person": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "city": "San Francisco",
    "state": "CA",
    "country": "United States",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "description": "Experienced software engineer",
    "all_raw_tags": ["javascript", "react", "node.js"]
  }
}
```

**Response (200 Success):**
```json
{
  "id": 12345,
  "name": "John Doe",
  "email": "john.doe@example.com",
  ...
}
```

---

#### GET /{agency_slug}/people

Retrieves a list of people/candidates.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `per_page` | integer | Results per page |
| `q` | string | Search query |

---

#### GET /{agency_slug}/people/{id}

Retrieves a specific person by ID.

---

#### PUT /{agency_slug}/people/{id}

Updates an existing person record.

---

### Companies

#### POST /{agency_slug}/companies

Creates a new company record.

**Body Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `company[name]` | string | Company name |
| `company[description]` | string | Company description |
| `company[website]` | string | Company website |
| `company[industry]` | string | Industry |

---

#### GET /{agency_slug}/companies

Retrieves a list of companies.

---

### Jobs

#### POST /{agency_slug}/jobs

Creates a new job posting.

**Body Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `job[title]` | string | Job title |
| `job[description]` | string | Job description |
| `job[company_id]` | integer | Associated company ID |
| `job[location]` | string | Job location |
| `job[job_type_id]` | integer | Job type ID |

---

#### POST /{agency_slug}/jobs/{job_id}/apply

Applies a candidate to a job.

**Body Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `person_id` | integer | Person/candidate ID |
| `workflow_stage_id` | integer | Workflow stage ID |

---

### Reference Data Endpoints

These endpoints retrieve configuration and reference data:

| Endpoint | Description |
|----------|-------------|
| `GET /{agency_slug}/activity_types` | Activity types |
| `GET /{agency_slug}/address_types` | Address types |
| `GET /{agency_slug}/bonus_payment_types` | Bonus payment types |
| `GET /{agency_slug}/bonus_types` | Bonus types |
| `GET /{agency_slug}/company_global_statuses` | Company statuses |
| `GET /{agency_slug}/company_types` | Company types |
| `GET /{agency_slug}/compensation_types` | Compensation types |
| `GET /{agency_slug}/countries` | Countries list |
| `GET /{agency_slug}/countries/{id}/states` | States by country |
| `GET /{agency_slug}/countries/{id}/states/{id}/cities` | Cities |
| `GET /{agency_slug}/currencies` | Currencies |
| `GET /{agency_slug}/disability_statuses` | Disability statuses |
| `GET /{agency_slug}/diversity_types` | Diversity types |
| `GET /{agency_slug}/dynamic_fields` | Custom fields |
| `GET /{agency_slug}/education_types` | Education types |
| `GET /{agency_slug}/email_types` | Email types |
| `GET /{agency_slug}/equity_types` | Equity types |
| `GET /{agency_slug}/ethnicities` | Ethnicities |
| `GET /{agency_slug}/fee_types` | Fee types |
| `GET /{agency_slug}/genders` | Genders |
| `GET /{agency_slug}/job_categories` | Job categories |
| `GET /{agency_slug}/job_statuses` | Job statuses |
| `GET /{agency_slug}/job_types` | Job types |
| `GET /{agency_slug}/person_global_statuses` | Person statuses |
| `GET /{agency_slug}/person_types` | Person types |
| `GET /{agency_slug}/phone_types` | Phone types |
| `GET /{agency_slug}/pronouns` | Pronouns |
| `GET /{agency_slug}/seniority_levels` | Seniority levels |
| `GET /{agency_slug}/social_profile_types` | Social profile types |
| `GET /{agency_slug}/source_types` | Source types |
| `GET /{agency_slug}/veteran_statuses` | Veteran statuses |
| `GET /{agency_slug}/workflows` | Workflows |
| `GET /{agency_slug}/workflow_stages` | Workflow stages |

---

### Webhooks

#### POST /{agency_slug}/webhooks

Creates a new webhook subscription.

**Body Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `webhook[item_type]` | string | Item type (candidate, job, etc.) |
| `webhook[action]` | string | Action (create, update, delete) |
| `webhook[endpoint_url]` | string | Your webhook endpoint URL |

---

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": ["Specific error detail 1", "Specific error detail 2"]
}
```

---

## Rate Limiting

The Loxo API implements rate limiting. Please implement exponential backoff for retries.

---

## Notes for Integration

1. **Person vs Candidate**: A "person" is a contact record. A "candidate" is a person associated with a job application.

2. **Email Uniqueness**: Emails should be unique per agency. Check for existing records before creating.

3. **Dynamic Fields**: Custom fields specific to your agency can be set using the `person[$dynamic_field_key]` pattern.

4. **File Uploads**: For resume and document uploads, use `multipart/form-data` encoding.

---

## References

- [Official Loxo API Documentation](https://loxo.readme.io/reference/loxo-api)

