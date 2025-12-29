import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

// Mock cakes for fallback when database is unavailable
const mockCakes = [
  {
    id: '1',
    vendorId: '1',
    name: 'Chocolate Truffle Cake',
    slug: 'chocolate-truffle-cake',
    description: 'Rich and decadent chocolate cake with truffle coating',
    basePrice: 599,
    category: 'Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['chocolate', 'premium', 'popular'],
    popularity: 95,
    isActive: true,
    vendor: { id: '1', name: 'Sweet Dreams Bakery', slug: 'sweet-dreams' }
  },
  {
    id: '2',
    vendorId: '2',
    name: 'Strawberry Shortcake',
    slug: 'strawberry-shortcake',
    description: 'Fresh strawberry shortcake with cream',
    basePrice: 499,
    category: 'Cakes',
    images: ['https://images.unsplash.com/photo-1585080472049-f289083caea8?w=400'],
    tags: ['strawberry', 'fresh', 'seasonal'],
    popularity: 88,
    isActive: true,
    vendor: { id: '2', name: 'Cake Studio Pro', slug: 'cake-studio-pro' }
  },
  {
    id: '3',
    vendorId: '3',
    name: 'Black Forest Cake',
    slug: 'black-forest-cake',
    description: 'Classic black forest cake with cherries',
    basePrice: 749,
    category: 'Theme Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['chocolate', 'premium', 'theme'],
    popularity: 92,
    isActive: true,
    vendor: { id: '3', name: 'Divine Delights', slug: 'divine-delights' }
  },
  {
    id: '4',
    vendorId: '1',
    name: 'Vanilla Dream Cake',
    slug: 'vanilla-dream-cake',
    description: 'Soft vanilla cake with buttercream frosting',
    basePrice: 399,
    category: 'Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['vanilla', 'classic', 'popular'],
    popularity: 85,
    isActive: true,
    vendor: { id: '1', name: 'Sweet Dreams Bakery', slug: 'sweet-dreams' }
  },
  {
    id: '5',
    vendorId: '2',
    name: 'Red Velvet Cake',
    slug: 'red-velvet-cake',
    description: 'Elegant red velvet with cream cheese frosting',
    basePrice: 599,
    category: 'Occasion Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['red velvet', 'occasion', 'elegant'],
    popularity: 90,
    isActive: true,
    vendor: { id: '2', name: 'Cake Studio Pro', slug: 'cake-studio-pro' }
  },
  {
    id: '6',
    vendorId: '3',
    name: 'Carrot Cake',
    slug: 'carrot-cake',
    description: 'Moist carrot cake with cream cheese icing',
    basePrice: 449,
    category: 'Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['carrot', 'healthy', 'moist'],
    popularity: 78,
    isActive: true,
    vendor: { id: '3', name: 'Divine Delights', slug: 'divine-delights' }
  },
  {
    id: '7',
    vendorId: '4',
    name: 'Cheesecake Deluxe',
    slug: 'cheesecake-deluxe',
    description: 'Creamy New York style cheesecake',
    basePrice: 699,
    category: 'Desserts',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['cheesecake', 'premium', 'dessert'],
    popularity: 87,
    isActive: true,
    vendor: { id: '4', name: 'Heavenly Bakes', slug: 'heavenly-bakes' }
  },
  {
    id: '8',
    vendorId: '5',
    name: 'Lemon Zest Cake',
    slug: 'lemon-zest-cake',
    description: 'Refreshing lemon cake with zest glaze',
    basePrice: 459,
    category: 'Cakes',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    tags: ['lemon', 'fresh', 'citrus'],
    popularity: 81,
    isActive: true,
    vendor: { id: '5', name: 'Sugar & Spice', slug: 'sugar-spice' }
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    
    const cakes = await prisma.cake.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'All Cakes' && {
          OR: [
            { category: category },
            { tags: { has: category.toLowerCase() } }
          ]
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search.toLowerCase()] } }
          ]
        })
      },
      select: {
        id: true,
        vendorId: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
        category: true,
        images: true,
        tags: true,
        popularity: true,
        isActive: true,
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: 
        sortBy === 'price' ? { basePrice: 'asc' } :
        sortBy === 'vendor' ? { vendor: { name: 'asc' } } :
        { popularity: 'desc' }
    });
    
    return NextResponse.json(cakes);
  } catch (error) {
    console.error('Error fetching cakes from database:', error);
    
    // Fallback to mock data when database is unavailable
    let filteredCakes = [...mockCakes];
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    
    // Apply category filter
    if (category && category !== 'All Cakes') {
      filteredCakes = filteredCakes.filter(cake => 
        cake.category === category || cake.tags.includes(category.toLowerCase())
      );
    }
    
    // Apply search filter
    if (search) {
      filteredCakes = filteredCakes.filter(cake =>
        cake.name.toLowerCase().includes(search.toLowerCase()) ||
        cake.tags.some(tag => tag.includes(search.toLowerCase()))
      );
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      filteredCakes.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'vendor') {
      filteredCakes.sort((a, b) => a.vendor.name.localeCompare(b.vendor.name));
    } else {
      filteredCakes.sort((a, b) => b.popularity - a.popularity);
    }
    
    return NextResponse.json(filteredCakes);
  }
}