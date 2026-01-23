import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, flavor, size, toppings, frosting, message, theme } = await req.json();

    // Validate inputs
    if (!name || !flavor) {
      return NextResponse.json({
        success: false,
        error: 'Name and flavor are required'
      }, { status: 400 });
    }

    // Generate SVG directly - it's reliable and works everywhere
    const svgCake = generateCakeSVG(name, flavor, frosting || 'Classic', toppings || []);
    
    // Encode SVG to base64 using btoa (available on both server and client)
    let base64Svg = '';
    try {
      // Server-side: use Buffer
      if (typeof Buffer !== 'undefined') {
        base64Svg = Buffer.from(svgCake, 'utf-8').toString('base64');
      } else {
        // Fallback: use btoa
        base64Svg = btoa(unescape(encodeURIComponent(svgCake)));
      }
    } catch (encodeError) {
      // Final fallback
      base64Svg = Buffer.from(svgCake).toString('base64');
    }
    
    const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return NextResponse.json({
      imageUrl,
      success: true,
      method: 'svg-generated'
    });
  } catch (error) {
    console.error('Error generating cake image:', error);

    // Return fallback SVG even on error
    try {
      const fallbackSvg = generateCakeSVG('Your Cake', 'Delicious', 'Creamy', []);
      const base64Svg = Buffer.from(fallbackSvg).toString('base64');
      
      return NextResponse.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        success: true,
        method: 'fallback-svg'
      });
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate image'
      }, { status: 500 });
    }
  }
}

function generateCakeSVG(name: string, flavor: string, frosting: string, toppings: string[]): string {
  // Generate colors based on flavor and frosting
  const colorMap: Record<string, { cake: string; frosting: string }> = {
    chocolate: { cake: '#8B4513', frosting: '#654321' },
    vanilla: { cake: '#F5DEB3', frosting: '#FFF8DC' },
    strawberry: { cake: '#FFB6C1', frosting: '#FF69B4' },
    red: { cake: '#DC143C', frosting: '#FF1744' },
    velvet: { cake: '#C71585', frosting: '#FF1493' },
    lemon: { cake: '#FFFF00', frosting: '#FFD700' },
    carrot: { cake: '#FF8C00', frosting: '#FFB347' },
    cheesecake: { cake: '#F5DEB3', frosting: '#FFE4B5' },
    funfetti: { cake: '#FFB6C1', frosting: '#FFF8DC' },
    black: { cake: '#1a1a1a', frosting: '#333333' },
    white: { cake: '#FFFACD', frosting: '#FFFFFF' },
    default: { cake: '#D4A574', frosting: '#FFFACD' }
  };

  const flavorLower = flavor.toLowerCase();
  let colors = colorMap['default'];

  for (const key in colorMap) {
    if (flavorLower.includes(key)) {
      colors = colorMap[key];
      break;
    }
  }

  const toppingsList = toppings && toppings.length > 0 ? toppings.join(', ') : 'decorated';
  const safeName = name.substring(0, 20).replace(/[<>&"']/g, '');
  const safeFlavor = flavor.substring(0, 15).replace(/[<>&"']/g, '');
  const safeToppings = toppingsList.substring(0, 30).replace(/[<>&"']/g, '');

  return `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.cake};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B8956A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="frostingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.frosting};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0.7" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>

      <rect width="512" height="512" fill="#FFF9EB"/>

      <ellipse cx="256" cy="380" rx="140" ry="50" fill="#F0F0F0" filter="url(#shadow)"/>
      <ellipse cx="256" cy="375" rx="135" ry="45" fill="#FFFFFF" filter="url(#shadow)"/>

      <ellipse cx="256" cy="330" rx="120" ry="40" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <rect x="136" y="270" width="240" height="60" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <ellipse cx="256" cy="270" rx="120" ry="8" fill="rgba(0,0,0,0.1)"/>

      <ellipse cx="256" cy="220" rx="100" ry="35" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <rect x="156" y="170" width="200" height="50" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <ellipse cx="256" cy="170" rx="100" ry="8" fill="rgba(0,0,0,0.1)"/>

      <ellipse cx="256" cy="130" rx="80" ry="30" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <rect x="176" y="90" width="160" height="40" fill="url(#cakeGrad)" filter="url(#shadow)"/>
      <ellipse cx="256" cy="90" rx="80" ry="8" fill="rgba(0,0,0,0.1)"/>

      <path d="M 150 280 Q 170 260 190 280 Q 210 300 230 280 Q 250 260 270 280 Q 290 300 310 280 Q 330 260 350 280"
            stroke="url(#frostingGrad)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 160 180 Q 180 160 200 180 Q 220 200 240 180 Q 260 160 280 180 Q 300 200 320 180 Q 340 160 350 180"
            stroke="url(#frostingGrad)" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>

      <circle cx="180" cy="200" r="3" fill="#FFD700"/>
      <circle cx="210" cy="190" r="3" fill="#FF69B4"/>
      <circle cx="250" cy="185" r="3" fill="#FFD700"/>
      <circle cx="290" cy="195" r="3" fill="#FF69B4"/>
      <circle cx="320" cy="210" r="3" fill="#FFD700"/>

      <line x1="200" y1="240" x2="205" y2="250" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="240" y1="235" x2="235" y2="245" stroke="#FF69B4" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="280" y1="235" x2="285" y2="245" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="310" y1="245" x2="305" y2="255" stroke="#FF69B4" stroke-width="2.5" stroke-linecap="round"/>

      <rect x="248" y="45" width="8" height="35" fill="#FFD700" filter="url(#shadow)"/>
      <ellipse cx="252" cy="42" rx="6" ry="8" fill="#FFA500"/>
      <circle cx="252" cy="35" r="4" fill="#FF6347" opacity="0.8"/>
      <circle cx="252" cy="34" r="2" fill="#FFD700" opacity="0.6"/>

      <text x="256" y="410" font-size="22" font-weight="bold" text-anchor="middle" fill="#8B4513" font-family="Georgia, serif">
        ${safeName}
      </text>

      <text x="256" y="445" font-size="14" text-anchor="middle" fill="#A0522D" font-family="Georgia, serif">
        ${safeFlavor}
      </text>

      <text x="256" y="475" font-size="11" text-anchor="middle" fill="#999999" font-family="Arial, sans-serif">
        ${safeToppings}
      </text>
    </svg>
  `;
}
