import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.',
        },
        { status: 500 }
      );
    }

    const { name, flavor, size, toppings, frosting, message } = await req.json();

    // Validate inputs
    if (!name || !flavor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cake name and flavor are required',
        },
        { status: 400 }
      );
    }

    // Build detailed prompt for DALL-E
    const toppingsList = toppings && toppings.length > 0 ? toppings.join(', ') : 'elegantly decorated';
    
    const prompt = buildCakePrompt({
      name,
      flavor,
      size,
      toppings: toppingsList,
      frosting,
      message,
    });

    // Call DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });

    const imageUrl = response.data[0].url;

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate image from OpenAI',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      success: true,
      method: 'openai-dall-e-3',
      revisedPrompt: response.data[0].revised_prompt,
    });
  } catch (error: any) {
    console.error('Error generating cake image:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY.',
        },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
        },
        { status: 429 }
      );
    }

    if (error.status === 400) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request to OpenAI. Please try with different parameters.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate cake image',
      },
      { status: 500 }
    );
  }
}

/**
 * Build a detailed, vivid prompt for DALL-E 3
 * DALL-E 3 is very prompt-sensitive, so we need to be specific
 */
function buildCakePrompt({
  name,
  flavor,
  size,
  toppings,
  frosting,
  message,
}: {
  name: string;
  flavor: string;
  size: string;
  toppings: string;
  frosting: string;
  message: string;
}): string {
  const sizeDescription = getSizeDescription(size);

  const flavorDescription = getFlavorDescription(flavor);

  const frostingDescription = frostingDescriptions[frosting?.toLowerCase()] || 'beautifully frosted';

  let prompt = `A professional bakery-quality photograph of a stunning ${size} ${flavor} cake.`;

  prompt += ` The cake has ${frostingDescription} frosting with an elegant finish.`;

  if (toppings && toppings.trim() !== 'elegantly decorated') {
    prompt += ` It is decorated with ${toppings}.`;
  } else {
    prompt += ` It features elegant decorations and professional presentation.`;
  }

  if (message) {
    const safeName = message.substring(0, 50).replace(/[<>"]/g, '');
    prompt += ` The cake displays the text "${safeName}" written in elegant script or lettering on top.`;
  }

  prompt += ` The cake is displayed on a clean white plate or cake stand against a soft, blurred background.`;
  prompt += ` Professional studio lighting, shallow depth of field, bakery showcase style, 8k quality, mouth-watering presentation.`;

  return prompt;
}

function getSizeDescription(size: string): string {
  const sizeMap: Record<string, string> = {
    small: 'small (2-4 servings)',
    medium: 'medium (6-8 servings)',
    large: 'large (10-12 servings)',
    xlarge: 'extra-large celebration',
    '2-seater': 'small intimate',
    '4-seater': 'medium',
    '6-seater': 'large',
    '8-seater': 'extra-large',
  };

  return sizeMap[size?.toLowerCase()] || `${size} sized`;
}

function getFlavorDescription(flavor: string): string {
  const flavorMap: Record<string, string> = {
    chocolate: 'rich dark chocolate',
    vanilla: 'classic vanilla',
    strawberry: 'fresh strawberry',
    'red velvet': 'luxurious red velvet',
    cheesecake: 'creamy cheesecake',
    carrot: 'moist carrot cake',
    lemon: 'tangy lemon',
    funfetti: 'colorful funfetti',
    'black forest': 'elegant black forest with cherries',
    'german chocolate': 'german chocolate',
  };

  for (const [key, value] of Object.entries(flavorMap)) {
    if (flavor?.toLowerCase().includes(key)) {
      return value;
    }
  }

  return flavor || 'delicious';
}

const frostingDescriptions: Record<string, string> = {
  'classic': 'smooth white buttercream',
  'chocolate': 'rich chocolate buttercream',
  'cream cheese': 'tangy cream cheese',
  'swiss meringue': 'silky swiss meringue',
  'fondant': 'smooth white fondant',
  'ganache': 'glossy chocolate ganache',
  'ermine': 'luscious ermine',
  'american buttercream': 'creamy american buttercream',
  'italian meringue': 'elegant italian meringue',
};
