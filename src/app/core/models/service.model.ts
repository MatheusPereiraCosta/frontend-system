export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  popular?: boolean;
}
