export interface Customer {
  _id: string;
  name: string;
  email: string;
  password: string;
  profilePictures: string[];
  pointsWallet: string[];
  visitHistory: string[];
  favoriteRestaurants: string[];
  badges: string[];
  reviews: string[];
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}