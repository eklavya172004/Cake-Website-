// Centralized cake categories used across the application
export const CAKE_CATEGORIES = [
  {
    name: 'Cakes',
    submenu: [
      {
        title: 'Trending Cakes',
        items: [
          { label: 'Ribbon Cakes', param: 'cakeType=Ribbon Cakes' },
          { label: 'Fresh Drops', param: 'cakeType=Fresh Drops' },
          { label: 'Gourmet Cakes', param: 'cakeType=Gourmet Cakes' },
          { label: 'Bento Cakes', param: 'cakeType=Bento Cakes' },
          { label: 'Camera Cakes', param: 'cakeType=Camera Cakes' },
          { label: 'Anime Cakes', param: 'cakeType=Anime Cakes' },
        ]
      },
      {
        title: 'By Type',
        items: [
          { label: 'Bestsellers', param: 'cakeType=Bestsellers' },
          { label: 'Eggless Cakes', param: 'cakeType=Eggless Cakes' },
          { label: 'Photo Cakes', param: 'cakeType=Photo Cakes' },
          { label: 'Cheese Cakes', param: 'cakeType=Cheese Cakes' },
          { label: 'Half Cakes', param: 'cakeType=Half Cakes' },
        ]
      },
      {
        title: 'By Flavours',
        items: [
          { label: 'Chocolate', param: 'flavor=Chocolate' },
          { label: 'Vanilla', param: 'flavor=Vanilla' },
          { label: 'Strawberry', param: 'flavor=Strawberry' },
          { label: 'Butterscotch', param: 'flavor=Butterscotch' },
          { label: 'Black Forest', param: 'flavor=Black Forest' },
        ]
      },
      {
        title: 'Delivery Cities',
        items: [
          { label: 'Bangalore', param: 'deliveryCity=Bangalore' },
          { label: 'Delhi', param: 'deliveryCity=Delhi' },
          { label: 'Mumbai', param: 'deliveryCity=Mumbai' },
          { label: 'Hyderabad', param: 'deliveryCity=Hyderabad' },
          { label: 'Pune', param: 'deliveryCity=Pune' },
        ]
      }
    ]
  },
  { name: 'Theme Cakes', href: '/cakes/search?category=Theme Cakes' },
  { name: 'By Relationship', href: '/cakes/search?category=By Relationship' },
  { name: 'Desserts', href: '/cakes/search?category=Desserts' },
  { name: 'Birthday', href: '/cakes/search?category=Birthday' },
  { name: 'Hampers', href: '/cakes/search?category=Hampers' },
  { name: 'Anniversary', href: '/cakes/search?category=Anniversary' },
  { name: 'Occasions', href: '/cakes/search?category=Occasions' },
  { name: 'Customized Cakes', href: '/cakes/search?category=Customized Cakes' },
];

// Get flattened list of all categories for dropdown menus
export function getAllCategoryOptions() {
  const options: string[] = [];

  CAKE_CATEGORIES.forEach((category) => {
    if (typeof category === 'object' && 'name' in category) {
      if ('submenu' in category && category.submenu) {
        // Add main category
        options.push(category.name);
        // Add all submenu items
        category.submenu.forEach((section) => {
          section.items.forEach((item) => {
            if (!options.includes(item.label)) {
              options.push(item.label);
            }
          });
        });
      } else {
        // Just a simple category
        if (!options.includes(category.name)) {
          options.push(category.name);
        }
      }
    }
  });

  // Remove duplicates and sort
  return Array.from(new Set(options)).sort();
}
