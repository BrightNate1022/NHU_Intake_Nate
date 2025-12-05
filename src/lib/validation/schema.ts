import * as z from 'zod';

// Form data validation schema
export const formDataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')).default(''),
  title: z.string().optional().default(''),
  company: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default(''),
  description: z.string().max(5000, 'Description must be under 5000 characters').optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  sourceTypeId: z.number().nullable().optional().default(null),
  compensation: z.number().positive('Compensation must be positive').nullable().optional().default(null),
  compensationNotes: z.string().optional().default(''),
});

// Partial schema for updates (all fields optional)
export const partialFormDataSchema = formDataSchema.partial();

// Schema for creating a new form
export const createFormSchema = z.object({
  data: formDataSchema.partial().optional(),
});

// Schema for form submission to Loxo
export const submitFormSchema = formDataSchema.extend({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
});

export type FormDataInput = z.infer<typeof formDataSchema>;
export type PartialFormDataInput = z.infer<typeof partialFormDataSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;

// Default empty form data
export const defaultFormData: FormDataInput = {
  name: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  title: '',
  company: '',
  city: '',
  state: '',
  country: '',
  description: '',
  tags: [],
  sourceTypeId: null,
  compensation: null,
  compensationNotes: '',
};

