import { NextResponse } from 'next/server';
import BookingController from '@/app/lib/controllers/BookingController';
import requireAuth from '@/app/lib/auth/requireAuth';

/**
 * Handles GET requests to /api/bookings
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} Response containing bookings data or error message
 * @description 
 * - Returns facility bookings if facilityId and date are provided
 * - Returns specific user's bookings if userId is provided
 * - Returns current user's bookings by default
 */
export const GET = async (request) => {
    return requireAuth(request, async (user) => {
        try {
            const { searchParams } = new URL(request.url);
            const facilityId = searchParams.get('facilityId');
            const date = searchParams.get('date');
            const userId = searchParams.get('userId');
            
            const res = {
                status: (code) => ({
                    json: (data) => NextResponse.json(data, { status: code })
                }),
                json: (data) => NextResponse.json(data)
            };
            
            if (facilityId && date) {
                const bookings = await BookingController.getFacilityBookings(facilityId, date);
                return res.json(bookings);
            }
            
            if (userId) {
                const userBookings = await BookingController.getUserBookings(userId);
                return res.json(userBookings);
            }
            
            const userBookings = await BookingController.getUserBookings(user._id);
            return res.json(userBookings);
        } catch (error) {
            console.error('Error in GET /api/bookings:', error);
            return NextResponse.json(
                { message: error.message || 'Internal server error' },
                { status: error.statusCode || 500 }
            );
        }
    });
};

/**
 * Handles POST requests to /api/bookings
 * @param {Request} request - The incoming HTTP request containing booking data
 * @returns {Promise<NextResponse>} Response containing created booking or error message
 * @description Creates a new booking for the authenticated user
 */
export const POST = async (request) => {
    return requireAuth(request, async (user) => {
        try {
            const data = await request.json();
            
            const res = {
                status: (code) => ({
                    json: (data) => NextResponse.json(data, { status: code })
                }),
                json: (data) => NextResponse.json(data)
            };
            
            const bookingData = {
                ...data,
                user: user._id,
                status: 'pending',
                paymentStatus: 'pending'
            };
            
            const booking = await BookingController.store(bookingData);
            return res.status(201).json(booking);
        } catch (error) {
            console.error('Error creating booking:', error);
            return NextResponse.json(
                { message: error.message || 'Internal server error' },
                { status: error.statusCode || 500 }
            );
        }
    });
};