import { NextResponse } from 'next/server';
import FacilityController from '@/app/lib/controllers/FacilityController';
import { auth } from '@/app/lib/auth';

// GET /api/facilities/[id] - Get a single facility
export async function GET(request, { params }) {
  try {
    const facility = await FacilityController.show(params.id);
    if (!facility) {
      return NextResponse.json(
        { message: 'Facility not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(facility);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/facilities/[id] - Update a facility
export async function PUT(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const facility = await FacilityController.update(params.id, data);
    return NextResponse.json(facility);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/facilities/[id] - Delete a facility
export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await FacilityController.delete(params.id);
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
