import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Fetch cakes by category from database
    const cakes = await prisma.cake.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive',
        },
        isActive: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            rating: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
      orderBy: {
        popularity: 'desc',
      },
      take: limit,
      skip: skip,
    });

    // Calculate average rating for each cake
    const cakesWithRatings = cakes.map((cake) => {
      const avgRating =
        cake.reviews.length > 0
          ? cake.reviews.reduce((sum, review) => sum + review.rating, 0) /
            cake.reviews.length
          : 0;

      return {
        ...cake,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: cake.reviews.length,
      };
    });

    return NextResponse.json(cakesWithRatings);
  } catch (error) {
    console.error('Error fetching cakes by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cakes' },
      { status: 500 }
    );
  }
}
