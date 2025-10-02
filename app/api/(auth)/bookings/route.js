import { NextResponse } from 'next/server';
import BookingController from '@/app/lib/controllers/BookingController';
import { auth } from '@/app/lib/auth';

// GET /api/bookings - Get all bookings (admin) or user's bookings
export async function GET(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const facilityId = searchParams.get('facilityId');
    const date = searchParams.get('date');

    let bookings;
    if (facilityId && date) {
      // Get bookings for a specific facility on a specific date
      bookings = await BookingController.getFacilityBookings(facilityId, date);
    } else if (userId) {
      // Get bookings for a specific user
      bookings = await BookingController.getUserBookings(userId);
    } else if (session.user.role === 'admin') {
      // Admin can see all bookings
      bookings = await BookingController.index();
    } else {
      // Regular users can only see their own bookings
      bookings = await BookingController.getUserBookings(session.user.id);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
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
    // Ensure the booking is created for the logged-in user
    const bookingData = {
      ...data,
      user: session.user.id,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    const booking = await BookingController.store(bookingData);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
