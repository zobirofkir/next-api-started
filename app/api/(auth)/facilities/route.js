import { NextResponse } from 'next/server';
import FacilityController from '@/app/lib/controllers/FacilityController';
import { auth } from '@/app/lib/auth';

// GET /api/facilities - Get all facilities
export async function GET() {
  try {
    const facilities = await FacilityController.index();
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/facilities - Create a new facility
export async function POST(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const facility = await FacilityController.store(data);
    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
