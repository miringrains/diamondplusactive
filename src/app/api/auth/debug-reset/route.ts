import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Log all headers and URL info
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const debugInfo = {
    url: request.url,
    pathname: request.nextUrl.pathname,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    headers: headers,
    cfHeaders: {
      'cf-ray': request.headers.get('cf-ray'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    }
  }

  console.log('[DEBUG-RESET] Request info:', JSON.stringify(debugInfo, null, 2))

  // Return debug info as JSON
  return NextResponse.json(debugInfo)
}
