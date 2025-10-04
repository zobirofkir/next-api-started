import { NextResponse } from 'next/server';

const baseCorsHeaders = {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function middleware(request) {
  const origin = request.headers.get('origin');

  // Preflight
  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    Object.entries(baseCorsHeaders).forEach(([k, v]) => preflight.headers.set(k, v));
    if (origin) {
      preflight.headers.set('Access-Control-Allow-Origin', origin);
      preflight.headers.set('Access-Control-Allow-Credentials', 'true');
      preflight.headers.set('Vary', 'Origin');
    } else {
      preflight.headers.set('Access-Control-Allow-Origin', '*');
    }
    return preflight;
  }

  const response = NextResponse.next();
  Object.entries(baseCorsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  return response;
}

export const config = {
  matcher: ['/:path*'],
};


