export interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory?: string | null;
  strAlcoholic?: string | null;
  strGlass?: string | null;
  strInstructions?: string | null;
  strIngredient1?: string | null;
  strIngredient2?: string | null;
  strIngredient3?: string | null;
  strIngredient4?: string | null;
  strIngredient5?: string | null;
  strIngredient6?: string | null;
  strIngredient7?: string | null;
  strIngredient8?: string | null;
  strIngredient9?: string | null;
  strIngredient10?: string | null;
  strIngredient11?: string | null;
  strIngredient12?: string | null;
  strIngredient13?: string | null;
  strIngredient14?: string | null;
  strIngredient15?: string | null;
  strMeasure1?: string | null;
  strMeasure2?: string | null;
  strMeasure3?: string | null;
  strMeasure4?: string | null;
  strMeasure5?: string | null;
  strMeasure6?: string | null;
  strMeasure7?: string | null;
  strMeasure8?: string | null;
  strMeasure9?: string | null;
  strMeasure10?: string | null;
  strMeasure11?: string | null;
  strMeasure12?: string | null;
  strMeasure13?: string | null;
  strMeasure14?: string | null;
  strMeasure15?: string | null;
}

export interface Ingredient {
  name: string;
  measure: string;
}

/**
 * Extract a clean ingredients list from the flat strIngredient1..15 /
 * strMeasure1..15 fields TheCocktailDB uses.
 */
export function extractIngredients(d: Drink): Ingredient[] {
  const out: Ingredient[] = [];
  for (let i = 1; i <= 15; i++) {
    const name = (d[`strIngredient${i}` as keyof Drink] as string | null)?.trim();
    if (!name) continue;
    const measure = (d[`strMeasure${i}` as keyof Drink] as string | null)?.trim() || '—';
    out.push({ name, measure });
  }
  return out;
}

/** Curated classics for the initial browse experience — guaranteed known-good results. */
export const CURATED_NAMES = [
  'Margarita',
  'Mojito',
  'Old Fashioned',
  'Negroni',
  'Cosmopolitan',
  'Martini',
  'Daiquiri',
  'Whiskey Sour',
  'Manhattan',
  'Aperol Spritz',
  'Mimosa',
  'Blue Lagoon',
] as const;

/** Deterministic "drink of the day" pick from a list. */
export function pickDrinkOfTheDay<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return list[dayOfYear % list.length];
}
