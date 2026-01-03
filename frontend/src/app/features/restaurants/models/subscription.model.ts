export interface Subscription {
  planType: 'NORMAL' | 'PREMIUM';
  isActive: boolean;
  startDate: string;
  endDate?: string;
}
