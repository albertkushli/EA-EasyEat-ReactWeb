export interface ICustomer {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  refreshTokenHash?: string;
  isActive?: boolean;
  deletedAt?: Date | null;        // null = alive, Date = soft-deleted
  profilePictures?: string[];
  pointsWallet?: string[];
  visitHistory?: string[];
  favoriteRestaurants?: string[];
  badges?: string[];
  reviews?: string[];
}
