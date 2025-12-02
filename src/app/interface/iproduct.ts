export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  slug?: string;
  price: number;
  description: string;
  category?: Category | string;
  images: string[];
  thumbnail?: string;
  image?: string;
  brand?: string;
  stock?: number;
  rating?: number | {
    rate: number;
    count: number;
  };
  discountPercentage?: number;
  creationAt?: string;
  updatedAt?: string;
  quantity?: number;
}
