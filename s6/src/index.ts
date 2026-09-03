import {
  books,
  calculateTotalValue,
  filterByCategory,
  formatBookSummary,
} from "./catalog";
import { BookCategory } from "./models";

function printSection(title: string, lines: string[]): void {
  console.log(`\n=== ${title} ===`);
  lines.forEach((line) => console.log(line));
}

const categories: BookCategory[] = [
  "fiction",
  "science",
  "history",
  "technology",
];

printSection("Catálogo completo", books.map(formatBookSummary));

categories.forEach((category) => {
  const filtered = filterByCategory(books, category);
  printSection(
    `Libros de categoría "${category}" (${filtered.length})`,
    filtered.map(formatBookSummary)
  );
});

const inStock = books.filter((book) => book.inStock);
const totalCatalogValue = calculateTotalValue(books);
const inStockValue = calculateTotalValue(inStock);

printSection("Resumen", [
  `Total de títulos: ${books.length}`,
  `En stock: ${inStock.length}`,
  `Valor total del catálogo: $${totalCatalogValue.toFixed(2)}`,
  `Valor de títulos disponibles: $${inStockValue.toFixed(2)}`,
]);
