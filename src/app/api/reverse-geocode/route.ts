import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }
    
    // Using OpenCage Geocoding API (you can use any geocoding service)
    // Get your API key from https://opencagedata.com/
    const apiKey = process.env.OPENCAGE_API_KEY;
    
    if (!apiKey) {
      // Fallback: mock pincode based on coordinates
      // In production, you should use a real geocoding service
      return NextResponse.json({ pincode: '110001' });
    }
    
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const pincode = data.results[0].components.postcode;
      return NextResponse.json({ pincode });
    }
    
    return NextResponse.json({ error: 'Could not determine pincode' }, { status: 404 });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}