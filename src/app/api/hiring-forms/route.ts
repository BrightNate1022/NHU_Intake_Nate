import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import type { HiringIntakeForm, HiringIntakeFormData } from '@/types';
import { nanoid } from 'nanoid';

// Default empty form data
const defaultHiringIntakeFormData: HiringIntakeFormData = {
  clientCompany: {
    name: '',
    address: {},
    contactName: '',
    contacts: [],
    feeStructure: { rawString: '' },
  },
  meetingDate: '',
  jobTitle: '',
};

// GET /api/hiring-forms - List all hiring forms
export async function GET() {
  try {
    const db = await getDatabase();
    const forms = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching hiring forms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST /api/hiring-forms - Create a new hiring form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formId = body.formId || nanoid(10);

    const db = await getDatabase();

    // Check if form already exists
    const existingForm = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .findOne({ formId });

    if (existingForm) {
      return NextResponse.json({ success: true, data: existingForm });
    }

    const newForm: Omit<HiringIntakeForm, '_id'> = {
      formId,
      status: 'draft',
      loxoJobId: null,
      loxoCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: null,
      data: defaultHiringIntakeFormData,
      collaborators: [],
    };

    await db.collection<HiringIntakeForm>('hiringIntakeForms').insertOne(newForm as HiringIntakeForm);

    return NextResponse.json({ success: true, data: newForm }, { status: 201 });
  } catch (error) {
    console.error('Error creating hiring form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create form' },
      { status: 500 }
    );
  }
}

