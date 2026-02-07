import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ cakes: [] });
    }

    const cakes = await prisma.cake.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            flavor: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            cakeType: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        vendorId: true,
        basePrice: true,
        images: true,
        rating: true,
      },
      take: 10,
      orderBy: {
        popularity: 'desc',
      },
    });

    return NextResponse.json({
      cakes: cakes.map((cake: any) => ({
        ...cake,
        basePrice: parseFloat(cake.basePrice.toString()),
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search cakes' },
      { status: 500 }
    );
  }
}
