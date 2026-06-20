export interface PointsWallet {
  _id?: string;
  customer_id: string; // reference to Customer
  restaurant_id: string; // reference to Restaurant
  points: number;
  createdAt?: string;
  updatedAt?: string;
}
