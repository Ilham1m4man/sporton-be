export interface IProduct {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  stock: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

// Response JOIN dengan category
export interface IProductWithCategory extends IProduct {
  category: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    created_at: Date;
    updated_at: Date;
  };
}

export interface IProductInput {
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  stock?: number; // Optional karena DEFAULT 0 di DB
  price: number;
}