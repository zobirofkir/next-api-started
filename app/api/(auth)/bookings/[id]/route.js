import { NextResponse } from 'next/server';
import BookingController from '@/app/lib/controllers/BookingController';
import requireAuth from '@/app/lib/auth/requireAuth';

// GET /api/bookings/[id] - Get a single booking
export async function GET(request, { params }) {
  const { id } = await params;
  return requireAuth(request, async (user) => {
    try {
      const booking = await BookingController.show(id);
      
      // Check if the user is authorized to view this booking
      const bookingUserId = booking.user?.id || booking.user?._id || booking.user;
      if (String(bookingUserId) !== String(user._id)) {
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
  });
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(request, { params }) {
  const { id } = await params;
  return requireAuth(request, async (user) => {
    try {
      const booking = await BookingController.show(id);
      
      // Check if the user is authorized to update this booking
      const bookingUserId = booking.user?.id || booking.user?._id || booking.user;
      if (String(bookingUserId) !== String(user._id)) {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        );
      }

      const data = await request.json();
      const updatedBooking = await BookingController.update(id, data);
      return NextResponse.json(updatedBooking);
    } catch (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
  });
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(request, { params }) {
  const { id } = await params;
  return requireAuth(request, async (user) => {
    try {
      const booking = await BookingController.show(id);
      
      // Check if the user is authorized to delete this booking
      const bookingUserId = booking.user?.id || booking.user?._id || booking.user;
      if (String(bookingUserId) !== String(user._id)) {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        );
      }

      // Instead of deleting, we'll mark it as cancelled
      const updatedBooking = await BookingController.updateStatus(id, 'cancelled');
      return NextResponse.json({ 
        success: true, 
        message: 'Booking cancelled successfully',
        booking: updatedBooking
      });
    } catch (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
  });
}
