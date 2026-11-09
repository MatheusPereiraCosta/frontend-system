export interface BusinessInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'barbearia' | 'salao' | 'estetica' | 'outro';
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  totalReviews: number;
}
