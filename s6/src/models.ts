export type BookCategory = "fiction" | "science" | "history" | "technology";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  pages: number;
  price: number;
  inStock: boolean;
}
