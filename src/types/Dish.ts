export interface Dish {
  _id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  section: 'Starters' | 'Mains' | 'Desserts' | 'Drinks' | 'Sides' | 'Specials';
  price: number;
  images?: string[];
  active: boolean;
  availableAt?: string[];
  ingredients?: string[];
  allergens?: string[];
  dietaryFlags?: string[];
  flavorProfile?: string[];
  cuisineTags?: string[];
  portionSize?: 'small' | 'medium' | 'large' | 'sharing';
  avgRating?: number;
  ratingsCount?: number;
  createdAt: string;
  updatedAt: string;
}
