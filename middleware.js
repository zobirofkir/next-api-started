import { NextResponse } from 'next/server';

/**
 * Base CORS headers configuration
 * @type {Object.<string, string>}
 */
const baseCorsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * List of allowed origins for CORS
 * @type {string[]}
 */
const allowedOrigins = [
  'http://localhost:3000',
  'https://next-api-started.vercel.app',
];

/**
 * Middleware function to handle CORS and request logging
 * @param {import('next/server').NextRequest} request - The incoming request object
 * @returns {import('next/server').NextResponse} The response object
 */
export function middleware(request) {
  const origin = request.headers.get('origin');
  
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`, {
    origin,
    headers: Object.fromEntries(request.headers.entries())
  });

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    Object.entries(baseCorsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    setCorsOriginHeaders(response, origin);
    return response;
  }

  const response = NextResponse.next();
  Object.entries(baseCorsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  setCorsOriginHeaders(response, origin);
  return response;
}

/**
 * Sets the appropriate CORS origin headers on the response
 * @param {import('next/server').NextResponse} response - The response object
 * @param {string|null} origin - The origin from the request headers
 */
function setCorsOriginHeaders(response, origin) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  } else if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }
}

/**
 * Middleware configuration
 * @type {{ matcher: string[] }}
 */
export const config = {
  matcher: ['/api/:path*', '/auth/:path*'],
};

