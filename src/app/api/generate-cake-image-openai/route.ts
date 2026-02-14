import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { name, flavor, size, toppings, frosting, message } = await req.json();

    if (!name || !flavor) {
      return NextResponse.json(
        { success: false, error: 'Cake name and flavor are required' },
        { status: 400 }
      );
    }

    const toppingsList =
      Array.isArray(toppings) && toppings.length > 0
        ? toppings.join(', ')
        : 'elegant bakery-style decorations';

    const prompt = buildCakePrompt({
      flavor,
      size,
      toppings: toppingsList,
      frosting,
      message,
    });

    const client = getOpenAIClient();

    // Optional timeout protection
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await client.images.generate(
      {
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'low',
      },
      { signal: controller.signal }
    );

    const imageData = response.data?.[0];

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'No image returned from OpenAI' },
        { status: 500 }
      );
    }

    // ✅ Handle BOTH url and base64
    const imageUrl =
      imageData.url ??
      (imageData.b64_json
        ? `data:image/png;base64,${imageData.b64_json}`
        : null);

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt: imageData.revised_prompt,
      model: 'gpt-image-1',
      size: '1024x1024',
    });
  } catch (error: unknown) {
    console.error('Error generating cake image:', error);
        // file deleted
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
    return NextResponse.json(
      {
        success: false,
        error:
          isAbortError
            ? 'Image generation timed out'
            : errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Prompt optimized for preview images
 * (resize on frontend)
 */
function buildCakePrompt({
  flavor,
  size,
  toppings,
  frosting,
  message,
}: {
  flavor: string;
  size: string;
  toppings: string;
  frosting: string;
  message?: string;
}): string {
  const sizeDescription = getSizeDescription(size);
  const flavorDescription = getFlavorDescription(flavor);
  const frostingDescription =
    frostingDescriptions[frosting?.toLowerCase()] || 'smooth buttercream';

  let prompt = `A realistic professional bakery photograph of a ${sizeDescription} ${flavorDescription} cake.`;

  prompt += ` The cake has ${frostingDescription} frosting.`;
  prompt += ` Decorated with ${toppings}.`;

  if (message) {
    const safeText = message.substring(0, 40).replace(/[<>"]/g, '');
    prompt += ` The cake has the text "${safeText}" written neatly on top.`;
  }

  prompt += ` Clean background, soft studio lighting, sharp focus, no watermark.`;

  return prompt;
}

function getSizeDescription(size: string): string {
  const map: Record<string, string> = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    xlarge: 'extra large',
    '2-seater': 'small',
    '4-seater': 'medium',
    '6-seater': 'large',
    '8-seater': 'extra large',
  };

  return map[size?.toLowerCase()] || 'medium';
}

function getFlavorDescription(flavor: string): string {
  const map: Record<string, string> = {
    chocolate: 'rich chocolate',
    vanilla: 'classic vanilla',
    strawberry: 'fresh strawberry',
    'red velvet': 'red velvet',
    cheesecake: 'cheesecake',
    carrot: 'carrot cake',
    lemon: 'lemon',
    funfetti: 'funfetti',
    'black forest': 'black forest',
  };

  for (const key in map) {
    if (flavor?.toLowerCase().includes(key)) {
      return map[key];
    }
  }

  return flavor;
}

const frostingDescriptions: Record<string, string> = {
  classic: 'smooth white buttercream',
  chocolate: 'rich chocolate buttercream',
  'cream cheese': 'cream cheese frosting',
  fondant: 'smooth fondant',
  ganache: 'glossy chocolate ganache',
};