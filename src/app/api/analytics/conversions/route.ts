import { NextRequest, NextResponse } from 'next/server'

// Temporary stub for conversions API - to be implemented later
export async function POST(_request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Conversion tracking - coming soon' 
  })
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    data: {
      totalConversions: 0,
      conversionRate: 0,
      message: 'Conversion analytics - coming soon'
    }
  })
}
