import { NextResponse } from 'next/server';
import BookingController from '@/app/lib/controllers/BookingController';
import { auth } from '@/app/lib/auth';

/**
 * Handles GET requests to /api/bookings
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} Response containing bookings data or error message
 * @description 
 * - Returns facility bookings if facilityId and date are provided
 * - Returns specific user's bookings if userId is provided
 * - Returns current user's bookings by default
 */
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
    const facilityId = searchParams.get('facilityId');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    
    if (facilityId && date) {
      const bookings = await BookingController.getFacilityBookings(facilityId, date);
      return NextResponse.json(bookings);
    }
    
    if (userId) {
      const userBookings = await BookingController.getUserBookings(userId);
      return NextResponse.json(userBookings);
    }
    
    const userBookings = await BookingController.getUserBookings(session.user.id);
    return NextResponse.json(userBookings);

  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * Handles POST requests to /api/bookings
 * @param {Request} request - The incoming HTTP request containing booking data
 * @returns {Promise<NextResponse>} Response containing created booking or error message
 * @description Creates a new booking for the authenticated user
 */
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
