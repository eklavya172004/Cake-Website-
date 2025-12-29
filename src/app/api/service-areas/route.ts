import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // Get all unique service areas from vendors
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      select: { serviceAreas: true }
    });
    
    // Extract all unique pincodes
    const allPincodes = new Set<string>();
    vendors.forEach(vendor => {
      vendor.serviceAreas.forEach(pincode => allPincodes.add(pincode));
    });
    
    // Group pincodes by area (you might want to maintain a separate table for this)
    // For now, returning a basic structure
    const serviceAreas = [
      { name: 'North Delhi', pincodes: Array.from(allPincodes).filter(p => p.startsWith('110')) },
      { name: 'Gurgaon', pincodes: Array.from(allPincodes).filter(p => p.startsWith('122')) },
      { name: 'Faridabad', pincodes: Array.from(allPincodes).filter(p => p.startsWith('121')) },
      { name: 'Ghaziabad', pincodes: Array.from(allPincodes).filter(p => p.startsWith('201') && parseInt(p) < 201300) },
      { name: 'Noida', pincodes: Array.from(allPincodes).filter(p => p.startsWith('201') && parseInt(p) >= 201300) },
    ].filter(area => area.pincodes.length > 0);
    
    return NextResponse.json(serviceAreas);
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return NextResponse.json({ error: 'Failed to fetch service areas' }, { status: 500 });
  }
}