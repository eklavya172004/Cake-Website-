import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const cakeType = searchParams.get('cakeType');
    const flavor = searchParams.get('flavor');
    const deliveryCity = searchParams.get('deliveryCity');
    const searchQuery = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (cakeType) {
      where.cakeType = {
        equals: cakeType,
        mode: 'insensitive',
      };
    }

    if (flavor) {
      where.flavor = {
        equals: flavor,
        mode: 'insensitive',
      };
    }

    if (deliveryCity) {
      where.deliveryCity = {
        equals: deliveryCity,
        mode: 'insensitive',
      };
    }

    if (searchQuery) {
      where.OR = [
        {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Fetch cakes with filters
    const [cakes, total] = await Promise.all([
      prisma.cake.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
              rating: true,
              deliveryFee: true,
            },
          },
        },
        orderBy: {
          popularity: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.cake.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cakes.map((cake: any) => ({
        ...cake,
        basePrice: parseFloat(cake.basePrice.toString()),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error filtering cakes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to filter cakes' },
      { status: 500 }
    );
  }
}
