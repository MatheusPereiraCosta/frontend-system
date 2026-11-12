export interface BusinessInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
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

/** Resultado público da busca (sem WhatsApp nem endereço completo). */
export interface BusinessSummary {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  city: string;
  state: string;
  neighborhood: string;
  logoUrl: string;
  rating: number;
  totalReviews: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}
