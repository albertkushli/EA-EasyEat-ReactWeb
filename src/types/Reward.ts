export interface Reward {
  _id: string;
  restaurant_id: string;
  name: string;
  description: string;
  pointsRequired: number;
  active: boolean;
  expiry?: string;
  timesRedeemed: number;
  createdAt?: string;
  updatedAt?: string;
}
