import { NextResponse } from 'next/server';

const baseCorsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

const allowedOrigins = [
  'http://localhost:3000',
  'https://next-api-started.vercel.app',
  // Add other allowed origins here
];

export function middleware(request) {
  const origin = request.headers.get('origin');
  
  // Log request for debugging
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`, {
    origin,
    headers: Object.fromEntries(request.headers.entries())
  });

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    // Apply CORS headers
    Object.entries(baseCorsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set allowed origin
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow any origin
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }

    return response;
  }

  // Handle regular requests
  const response = NextResponse.next();
  
  // Apply CORS headers
  Object.entries(baseCorsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Set allowed origin
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow any origin
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/auth/:path*'],
};

