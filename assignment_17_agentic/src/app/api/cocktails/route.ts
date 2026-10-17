import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

interface CacheEntry {
  data: unknown;
  expiry: number;
}

// Simple in-memory cache with 10-minute TTL
const cache = new Map<string, CacheEntry>();
const TTL = 10 * 60 * 1000;

async function fetchUpstream(path: string, key: string): Promise<NextResponse> {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ drinks: [] }, { status: 200 });
    }
    const data = await res.json();
    // TheCocktailDB returns the string "no data found" instead of null for
    // some empty results — normalize EVERYTHING to an array here at the edge.
    const drinks = Array.isArray(data?.drinks) ? data.drinks : [];
    cache.set(key, { data: { drinks }, expiry: Date.now() + TTL });
    return NextResponse.json({ drinks });
  } catch {
    return NextResponse.json({ drinks: [], error: 'upstream-unavailable' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const letter = searchParams.get('letter');
  const ingredient = searchParams.get('ingredient');
  const id = searchParams.get('id');
  const random = searchParams.get('random');

  if (id) return fetchUpstream(`/lookup.php?i=${encodeURIComponent(id)}`, `id:${id}`);
  if (random === '1') return fetchUpstream('/random.php', `random:${Math.floor(Date.now() / 3600000)}`);
  if (ingredient) return fetchUpstream(`/filter.php?i=${encodeURIComponent(ingredient)}`, `ing:${ingredient}`);
  if (name) return fetchUpstream(`/search.php?s=${encodeURIComponent(name)}`, `name:${name.toLowerCase()}`);
  if (letter) return fetchUpstream(`/search.php?f=${encodeURIComponent(letter)}`, `letter:${letter}`);

  return fetchUpstream('/random.php', 'browse:fallback');
}
