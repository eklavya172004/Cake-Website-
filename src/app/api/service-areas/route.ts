import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // Get all unique service areas from vendors
    const serviceAreas = await prisma.vendorServiceArea.findMany({
      where: {
        vendor: {
          isActive: true
        }
      },
      select: {
        city: true,
        pincode: true,
      }
    });

    // Extract all unique pincodes
    const allPincodes = new Set<string>();
    serviceAreas.forEach((area: any) => allPincodes.add(area.pincode));

    // Group pincodes by area
    const groupedAreas = [
      { name: 'North Delhi', pincodes: Array.from(allPincodes).filter(p => p.startsWith('1100')) },
      { name: 'South Delhi', pincodes: Array.from(allPincodes).filter(p => p.startsWith('1101')) },
      { name: 'Gurgaon', pincodes: Array.from(allPincodes).filter(p => p.startsWith('122')) },
      { name: 'Faridabad', pincodes: Array.from(allPincodes).filter(p => p.startsWith('121')) },
      { name: 'Ghaziabad', pincodes: Array.from(allPincodes).filter(p => p.startsWith('201') && parseInt(p) < 201300) },
      { name: 'Noida', pincodes: Array.from(allPincodes).filter(p => p.startsWith('201') && parseInt(p) >= 201300) },
    ].filter(area => area.pincodes.length > 0);

    return NextResponse.json(groupedAreas);
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return NextResponse.json({ error: 'Failed to fetch service areas' }, { status: 500 });
  }
}