import type { AnnonceCategory } from "../../services/api";

export const annonceCategories: Array<{
  label: string;
  value: AnnonceCategory;
}> = [
  { label: "Voiture", value: "car" },
  { label: "Électronique", value: "electronic" },
  { label: "Sport", value: "sport" },
  { label: "Maison", value: "home" },
];

export function categoryLabel(category: AnnonceCategory) {
  return (
    annonceCategories.find((item) => item.value === category)?.label ?? category
  );
}
