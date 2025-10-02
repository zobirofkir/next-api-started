import { NextResponse } from 'next/server';
import BookingController from '@/app/lib/controllers/BookingController';
import { auth } from '@/app/lib/auth';

// GET /api/bookings/[id] - Get a single booking
export async function GET(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const booking = await BookingController.show(params.id);
    
    // Check if the user is authorized to view this booking
    if (session.user.role !== 'admin' && booking.user.id !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const booking = await BookingController.show(params.id);
    
    // Check if the user is authorized to update this booking
    if (session.user.role !== 'admin' && booking.user.id !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedBooking = await BookingController.update(params.id, data);
    return NextResponse.json(updatedBooking);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const booking = await BookingController.show(params.id);
    
    // Check if the user is authorized to delete this booking
    if (session.user.role !== 'admin' && booking.user.id !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Instead of deleting, we'll mark it as cancelled
    await BookingController.updateStatus(params.id, 'cancelled');
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
