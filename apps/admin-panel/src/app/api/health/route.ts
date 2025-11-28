import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ChatBotDysa Admin Panel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
