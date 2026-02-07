import { prisma } from '@/lib/db/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const cakeId = formData.get('cakeId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const text = formData.get('text') as string;
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string | null;
    const files = formData.getAll('photos') as File[];

    // Validate inputs
    if (!cakeId || !rating || !text || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create review
    const photoUrls = await Promise.all(
      files.map(async (file) => ({
        url: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`,
      }))
    );

    const review = await prisma.cakeReview.create({
      data: {
        cakeId,
        rating,
        text,
        userName,
        userEmail: userEmail || undefined,
        photos: {
          create: photoUrls,
        },
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cakeId = req.nextUrl.searchParams.get('cakeId');

    if (!cakeId) {
      return NextResponse.json(
        { error: 'cakeId is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.cakeReview.findMany({
      where: { cakeId },
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
