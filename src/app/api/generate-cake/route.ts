import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limit constants
const MAX_GENERATIONS_PER_USER = 10; // Total per user
const MAX_GENERATIONS_PER_CAKE = 2; // Per cake

// Function to download and upload image from OpenAI to Cloudinary
async function uploadGeneratedImageToCloudinary(imageUrl: string, userId: string): Promise<string | null> {
  try {
    // Download image from OpenAI URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'cake-shop/generated-images',
          resource_type: 'auto',
          quality: 'auto',
          public_id: `cake-${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve((result as any)?.secure_url || null);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Failed to upload generated image to Cloudinary:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, cakeId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get user identification
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email;

    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to generate cake images' },
        { status: 401 }
      );
    }

    // Check if user has exceeded total generation limit
    let userGenerationCount = 0;
    try {
      userGenerationCount = await db.cakeImageGeneration.count({
        where: {
          userId,
          status: 'success',
        },
      });

      if (userGenerationCount >= MAX_GENERATIONS_PER_USER) {
        return NextResponse.json(
          {
            error: `You've reached your limit of ${MAX_GENERATIONS_PER_USER} cake image generations. You have used all your free generations.`,
            remaining: 0,
            total: MAX_GENERATIONS_PER_USER,
          },
          { status: 429 }
        );
      }

      // Check per-cake limit if cakeId is provided
      if (cakeId) {
        const cakeGenerationCount = await db.cakeImageGeneration.count({
          where: {
            userId,
            cakeId,
            status: 'success',
          },
        });

        if (cakeGenerationCount >= MAX_GENERATIONS_PER_CAKE) {
          return NextResponse.json(
            {
              error: `You can only generate this cake image ${MAX_GENERATIONS_PER_CAKE} times. Please try customizing other cakes.`,
              remaining: 0,
              cakeLimit: MAX_GENERATIONS_PER_CAKE,
            },
            { status: 429 }
          );
        }
      }
    } catch (error: any) {
      // If rate limit table doesn't exist yet (during initial setup), skip rate limiting
      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        console.warn('⚠️ CakeImageGeneration table not found - skipping rate limiting');
      } else {
        throw error;
      }
    }

    // Generate image with OpenAI
    const finalPrompt = `
A realistic professional bakery photograph of a cake.
Cake description: ${prompt}.
Soft studio lighting, clean background, no watermark.
`;

    let imageUrl: string | null = null;
    let generationError: string | null = null;

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: finalPrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });

      const image = response.data?.[0];

      if (!image) {
        generationError = 'No image returned from OpenAI';
      } else if (image.url) {
        // Upload OpenAI image to Cloudinary to avoid CORS issues
        console.log('📤 Uploading generated image to Cloudinary...');
        const cloudinaryUrl = await uploadGeneratedImageToCloudinary(image.url, userId);
        
        if (cloudinaryUrl) {
          imageUrl = cloudinaryUrl;
          console.log('✅ Image uploaded to Cloudinary:', cloudinaryUrl);
        } else {
          generationError = 'Failed to upload generated image to storage';
        }
      } else if (image.b64_json) {
        imageUrl = `data:image/png;base64,${image.b64_json}`;
      } else {
        generationError = 'Image generation returned invalid format';
      }
    } catch (aiError: any) {
      generationError = aiError.message || 'OpenAI image generation failed';
      console.error('OpenAI error:', aiError);
    }

    // Track the generation attempt
    try {
      await db.cakeImageGeneration.create({
        data: {
          userId,
          cakeId: cakeId || null,
          prompt,
          imageUrl,
          status: imageUrl ? 'success' : 'failed',
          error: generationError,
        },
      });
    } catch (dbError) {
      console.error('Failed to track generation:', dbError);
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: generationError || 'Image generation failed' },
        { status: 500 }
      );
    }

    // Calculate remaining generations
    const newUserCount = userGenerationCount + 1;
    const remaining = MAX_GENERATIONS_PER_USER - newUserCount;

    return NextResponse.json({
      success: true,
      imageUrl,
      remaining,
      total: MAX_GENERATIONS_PER_USER,
      usageInfo: `You've used ${newUserCount}/${MAX_GENERATIONS_PER_USER} cake image generations`,
    });
  } catch (error: any) {
    console.error('Cake generation error:', error);

    return NextResponse.json(
      { error: error.message || 'Cake generation failed' },
      { status: 500 }
    );
  }
}
