import { Book, BookCategory } from "./models";

export const books: Book[] = [
  {
    id: "b001",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    category: "fiction",
    pages: 471,
    price: 18.5,
    inStock: true,
  },
  {
    id: "b002",
    title: "Breve historia del tiempo",
    author: "Stephen Hawking",
    category: "science",
    pages: 256,
    price: 22.0,
    inStock: true,
  },
  {
    id: "b003",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "history",
    pages: 498,
    price: 24.99,
    inStock: false,
  },
  {
    id: "b004",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "technology",
    pages: 464,
    price: 35.0,
    inStock: true,
  },
  {
    id: "b005",
    title: "El nombre del viento",
    author: "Patrick Rothfuss",
    category: "fiction",
    pages: 662,
    price: 19.95,
    inStock: true,
  },
];

export function filterByCategory(
  catalog: Book[],
  category: BookCategory
): Book[] {
  return catalog.filter((book) => book.category === category);
}

export function calculateTotalValue(catalog: Book[]): number {
  return catalog.reduce((total, book) => total + book.price, 0);
}

export function formatBookSummary(book: Book): string {
  const availability = book.inStock ? "disponible" : "agotado";
  return `"${book.title}" de ${book.author} (${book.pages} págs.) — $${book.price.toFixed(2)} [${availability}]`;
}
