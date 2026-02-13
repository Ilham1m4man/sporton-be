export interface ICategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICategoryDTO {
  name: string;
  description: string;
  image_url: string;
}