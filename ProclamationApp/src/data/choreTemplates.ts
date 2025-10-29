export interface ChoreTemplate {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: 'kitchen' | 'bedroom' | 'bathroom' | 'outdoor' | 'pets' | 'general';
}

export const choreTemplates: ChoreTemplate[] = [
  // Kitchen Chores
  {
    id: 'kitchen-1',
    title: 'Wash Dishes',
    description: 'Wash all dishes in the sink and dry them',
    reward: 3.00,
    category: 'kitchen',
  },
  {
    id: 'kitchen-2',
    title: 'Load/Unload Dishwasher',
    description: 'Load dirty dishes or unload clean dishes from dishwasher',
    reward: 2.50,
    category: 'kitchen',
  },
  {
    id: 'kitchen-3',
    title: 'Wipe Down Counters',
    description: 'Clean and sanitize all kitchen counters',
    reward: 2.00,
    category: 'kitchen',
  },
  {
    id: 'kitchen-4',
    title: 'Take Out Trash',
    description: 'Empty all trash cans and take bags to outdoor bins',
    reward: 2.50,
    category: 'kitchen',
  },
  {
    id: 'kitchen-5',
    title: 'Sweep Kitchen Floor',
    description: 'Sweep and spot mop the kitchen floor',
    reward: 3.00,
    category: 'kitchen',
  },
  {
    id: 'kitchen-6',
    title: 'Clean Microwave',
    description: 'Clean inside and outside of microwave',
    reward: 3.50,
    category: 'kitchen',
  },
  {
    id: 'kitchen-7',
    title: 'Organize Pantry',
    description: 'Organize pantry shelves and check for expired items',
    reward: 5.00,
    category: 'kitchen',
  },

  // Bedroom Chores
  {
    id: 'bedroom-1',
    title: 'Make Your Bed',
    description: 'Make bed with sheets tucked and pillows arranged',
    reward: 1.00,
    category: 'bedroom',
  },
  {
    id: 'bedroom-2',
    title: 'Clean Your Room',
    description: 'Pick up toys, clothes, and organize your space',
    reward: 3.00,
    category: 'bedroom',
  },
  {
    id: 'bedroom-3',
    title: 'Vacuum Bedroom',
    description: 'Vacuum floor and under furniture',
    reward: 4.00,
    category: 'bedroom',
  },
  {
    id: 'bedroom-4',
    title: 'Organize Closet',
    description: 'Organize clothes, shoes, and closet items',
    reward: 5.00,
    category: 'bedroom',
  },
  {
    id: 'bedroom-5',
    title: 'Dust Furniture',
    description: 'Dust all surfaces in bedroom including shelves',
    reward: 2.50,
    category: 'bedroom',
  },
  {
    id: 'bedroom-6',
    title: 'Change Bed Sheets',
    description: 'Remove old sheets, wash them, and put on fresh sheets',
    reward: 4.00,
    category: 'bedroom',
  },

  // Bathroom Chores
  {
    id: 'bathroom-1',
    title: 'Clean Bathroom Sink',
    description: 'Scrub sink, faucet, and surrounding counter',
    reward: 2.50,
    category: 'bathroom',
  },
  {
    id: 'bathroom-2',
    title: 'Clean Toilet',
    description: 'Scrub toilet bowl, seat, and exterior',
    reward: 4.00,
    category: 'bathroom',
  },
  {
    id: 'bathroom-3',
    title: 'Clean Shower/Bathtub',
    description: 'Scrub shower walls, tub, and remove soap scum',
    reward: 5.00,
    category: 'bathroom',
  },
  {
    id: 'bathroom-4',
    title: 'Sweep/Mop Bathroom Floor',
    description: 'Sweep and mop bathroom floor',
    reward: 3.00,
    category: 'bathroom',
  },
  {
    id: 'bathroom-5',
    title: 'Restock Bathroom Supplies',
    description: 'Check and refill toilet paper, soap, towels',
    reward: 1.50,
    category: 'bathroom',
  },

  // Outdoor Chores
  {
    id: 'outdoor-1',
    title: 'Mow the Lawn',
    description: 'Mow front and back lawn',
    reward: 10.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-2',
    title: 'Rake Leaves',
    description: 'Rake leaves from yard and bag them',
    reward: 8.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-3',
    title: 'Water Plants/Garden',
    description: 'Water all outdoor plants and garden',
    reward: 3.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-4',
    title: 'Weed Garden',
    description: 'Pull weeds from garden beds and around yard',
    reward: 6.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-5',
    title: 'Wash Car',
    description: 'Wash and dry family car inside and out',
    reward: 12.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-6',
    title: 'Sweep Driveway/Patio',
    description: 'Sweep driveway, patio, and walkways',
    reward: 4.00,
    category: 'outdoor',
  },
  {
    id: 'outdoor-7',
    title: 'Take Out Recycling',
    description: 'Sort recycling and take bins to curb',
    reward: 2.50,
    category: 'outdoor',
  },

  // Pet Care
  {
    id: 'pets-1',
    title: 'Feed Pets',
    description: 'Feed pets their meals and refresh water',
    reward: 2.00,
    category: 'pets',
  },
  {
    id: 'pets-2',
    title: 'Walk the Dog',
    description: 'Take dog for 20-30 minute walk',
    reward: 5.00,
    category: 'pets',
  },
  {
    id: 'pets-3',
    title: 'Clean Litter Box',
    description: 'Scoop and clean cat litter box',
    reward: 3.00,
    category: 'pets',
  },
  {
    id: 'pets-4',
    title: 'Groom Pet',
    description: 'Brush pet fur and check for ticks/fleas',
    reward: 4.00,
    category: 'pets',
  },
  {
    id: 'pets-5',
    title: 'Clean Pet Area',
    description: 'Clean pet bed, toys, and feeding area',
    reward: 4.00,
    category: 'pets',
  },

  // General Household
  {
    id: 'general-1',
    title: 'Fold Laundry',
    description: 'Fold clean laundry and put it away',
    reward: 4.00,
    category: 'general',
  },
  {
    id: 'general-2',
    title: 'Vacuum Living Room',
    description: 'Vacuum living room floor and under furniture',
    reward: 4.00,
    category: 'general',
  },
  {
    id: 'general-3',
    title: 'Dust Living Areas',
    description: 'Dust all surfaces in living room and common areas',
    reward: 3.50,
    category: 'general',
  },
  {
    id: 'general-4',
    title: 'Organize Playroom',
    description: 'Pick up toys and organize play area',
    reward: 3.00,
    category: 'general',
  },
  {
    id: 'general-5',
    title: 'Clean Windows',
    description: 'Clean interior windows and window sills',
    reward: 6.00,
    category: 'general',
  },
  {
    id: 'general-6',
    title: 'Set/Clear Dinner Table',
    description: 'Set table before meals and clear after',
    reward: 1.50,
    category: 'general',
  },
  {
    id: 'general-7',
    title: 'Sort and Organize Mail',
    description: 'Collect, sort, and organize household mail',
    reward: 2.00,
    category: 'general',
  },
  {
    id: 'general-8',
    title: 'Clean Out Refrigerator',
    description: 'Remove expired items and wipe down shelves',
    reward: 5.00,
    category: 'general',
  },
];

export const getCategorizedTemplates = () => {
  const categories: Record<string, ChoreTemplate[]> = {
    kitchen: [],
    bedroom: [],
    bathroom: [],
    outdoor: [],
    pets: [],
    general: [],
  };

  choreTemplates.forEach(template => {
    categories[template.category].push(template);
  });

  return categories;
};

export const getCategoryDisplayName = (category: string): string => {
  const names: Record<string, string> = {
    kitchen: '🍳 Kitchen',
    bedroom: '🛏️ Bedroom',
    bathroom: '🚿 Bathroom',
    outdoor: '🌳 Outdoor',
    pets: '🐾 Pets',
    general: '🏠 General',
  };
  return names[category] || category;
};

