'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import {
  Citrus,
  GlassWater,
  Heart,
  Loader2,
  Martini,
  Search,
  Shuffle,
  Sparkles,
  Wine,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CURATED_NAMES,
  Drink,
  extractIngredients,
  pickDrinkOfTheDay,
} from '@/lib/cocktail';

const FAVORITES_KEY = 'dionysus:favorites';

interface FavoriteDrink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory?: string | null;
  strAlcoholic?: string | null;
}

function loadFavorites(): FavoriteDrink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function DrinkCard({
  drink,
  isFavorite,
  onToggleFavorite,
  onOpen,
  index,
}: {
  drink: Drink;
  isFavorite: boolean;
  onToggleFavorite: (d: Drink) => void;
  onOpen: (d: Drink) => void;
  index: number;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#3a2330] bg-[#1d1118] shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d9a648]/50 hover:shadow-[0_20px_50px_-15px_rgba(217,166,72,0.25)]"
      onClick={() => onOpen(drink)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#120a0f]">
        <img
          src={drink.strDrinkThumb}
          alt={drink.strDrink}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d1118] via-transparent to-transparent" />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-[#d9a648] px-4 py-1.5 text-xs font-semibold text-[#1c0f16] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View recipe
        </span>
        <button
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(drink);
          }}
          className={`absolute right-3 top-3 rounded-full border p-2 backdrop-blur transition-all duration-200 active:scale-90 ${
            isFavorite
              ? 'border-[#a34054] bg-[#a34054]/90 text-white shadow-[0_0_18px_rgba(163,64,84,0.6)]'
              : 'border-white/20 bg-black/40 text-white/80 opacity-0 hover:border-[#a34054] hover:text-[#e88fa2] group-hover:opacity-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {drink.strAlcoholic === 'Non alcoholic' && (
          <span className="absolute left-3 top-3 rounded-full border border-[#7fc8a9]/40 bg-[#12352a]/80 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#8fe3bd] backdrop-blur">
            Zero-proof
          </span>
        )}
      </div>
      <div className="space-y-2.5 p-5">
        <h3 className="font-display text-lg font-semibold leading-tight text-[#f3e9e2] transition-colors group-hover:text-[#f0cd8a]">
          {drink.strDrink}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#a08b94]">
          {drink.strCategory && (
            <span className="rounded-md bg-[#2a1923] px-2 py-1">{drink.strCategory}</span>
          )}
          {drink.strGlass && (
            <span className="inline-flex items-center gap-1">
              <GlassWater className="h-3 w-3" /> {drink.strGlass}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#3a2330] bg-[#1d1118]">
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-[#2a1923]" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3 bg-[#2a1923]" />
        <Skeleton className="h-4 w-1/3 bg-[#2a1923]" />
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyZeroProof, setOnlyZeroProof] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteDrink[]>([]);
  const [selected, setSelected] = useState<Drink | null>(null);
  const [detail, setDetail] = useState<Drink | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Press "/" anywhere to jump to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const persistFavorites = useCallback((next: FavoriteDrink[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleFavorite = useCallback(
    (d: Drink) => {
      const exists = favorites.some((f) => f.idDrink === d.idDrink);
      const next = exists
        ? favorites.filter((f) => f.idDrink !== d.idDrink)
        : [
            ...favorites,
            {
              idDrink: d.idDrink,
              strDrink: d.strDrink,
              strDrinkThumb: d.strDrinkThumb,
              strCategory: d.strCategory,
              strAlcoholic: d.strAlcoholic,
            },
          ];
      persistFavorites(next);
      toast(exists ? 'Removed from favorites' : `${d.strDrink} saved to favorites`, {
        icon: exists ? '🖤' : '💛',
      });
    },
    [favorites, persistFavorites]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.idDrink === id),
    [favorites]
  );

  // Initial curated browse — parallel fetch of classics, all cached server-side
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const responses = await Promise.all(
          CURATED_NAMES.map((n) =>
            fetch(`/api/cocktails?name=${encodeURIComponent(n)}`)
              .then((r) => r.json())
              .catch(() => ({ drinks: [] }))
          )
        );
        if (cancelled) return;
        const all: Drink[] = responses.flatMap((r: { drinks?: Drink[] }) =>
          Array.isArray(r.drinks) ? r.drinks.slice(0, 1) : []
        );
        setDrinks(all);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) return; // empty -> keep curated browse
    let cancelled = false;
    setSearching(true);
    fetch(`/api/cocktails?name=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: { drinks?: Drink[] }) => {
        if (cancelled) return;
        setDrinks(Array.isArray(data.drinks) ? data.drinks : []);
      })
      .catch(() => {
        if (!cancelled) setDrinks([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const surpriseMe = useCallback(async () => {
    setSearching(true);
    try {
      const r = await fetch('/api/cocktails?random=1');
      const data: { drinks?: Drink[] } = await r.json();
      const one = Array.isArray(data.drinks) ? data.drinks[0] : undefined;
      if (one) {
        setDrinks([one]);
        setQuery('');
        setActiveCategory(null);
        toast(`Fate chose ${one.strDrink}`, { icon: '🎲' });
      } else {
        toast.error('The bar is out of ideas — try again');
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const openDetail = useCallback((d: Drink) => {
    setSelected(d);
    setDetail(null);
    setDetailLoading(true);
    fetch(`/api/cocktails?id=${d.idDrink}`)
      .then((r) => r.json())
      .then((data: { drinks?: Drink[] }) => {
        setDetail(Array.isArray(data.drinks) ? data.drinks[0] ?? d : d);
      })
      .catch(() => setDetail(d))
      .finally(() => setDetailLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(drinks.map((d) => d.strCategory).filter(Boolean) as string[])),
    [drinks]
  );

  const visible: Drink[] = useMemo(() => {
    if (onlyFavorites) {
      // Show favorites from storage directly — they must survive across
      // searches and sessions, not be intersected with the current list.
      return favorites.map((f) => ({ ...f }) as Drink);
    }
    let list = drinks;
    if (onlyZeroProof) list = list.filter((d) => d.strAlcoholic === 'Non alcoholic');
    if (activeCategory) list = list.filter((d) => d.strCategory === activeCategory);
    return list;
  }, [drinks, onlyFavorites, onlyZeroProof, activeCategory, favorites]);

  const drinkOfDay = useMemo(() => pickDrinkOfTheDay(drinks), [drinks]);
  const isBrowsing = !query.trim();

  return (
    <div className="flex min-h-screen flex-col bg-[#120a0f] font-sans text-[#f3e9e2]">
      <Toaster theme="dark" position="top-center" />

      {/* Ambient background glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#a34054]/15 blur-[120px]" />
        <div className="absolute right-1/5 top-1/3 h-80 w-80 rounded-full bg-[#d9a648]/10 blur-[110px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#5c1f3c]/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#3a2330]/70 bg-[#120a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d9a648] to-[#a34054] shadow-[0_4px_20px_rgba(217,166,72,0.35)]">
              <Wine className="h-5 w-5 text-[#120a0f]" />
            </span>
            <span className="font-display text-xl font-bold tracking-wide text-[#f0cd8a]">
              Dionysus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={`gap-2 rounded-full ${
                onlyFavorites ? 'bg-[#a34054]/20 text-[#e88fa2]' : 'text-[#a08b94] hover:text-[#f3e9e2]'
              }`}
            >
              <Heart className={`h-4 w-4 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favorites.length > 0 && (
                <span className="rounded-full bg-[#a34054] px-1.5 text-[11px] font-semibold text-white">
                  {favorites.length}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={surpriseMe}
              className="gap-2 rounded-full bg-gradient-to-r from-[#d9a648] to-[#c07f2f] font-medium text-[#1c0f16] shadow-[0_4px_20px_rgba(217,166,72,0.3)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Surprise me</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        {/* Hero */}
        <section className="pb-10 pt-14 text-center sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9a648]/30 bg-[#d9a648]/10 px-4 py-1.5 text-xs font-medium tracking-widest text-[#f0cd8a] uppercase">
              <Sparkles className="h-3.5 w-3.5" /> A new classic every day
            </span>
            <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
              Every cocktail has a{' '}
              <span className="bg-gradient-to-r from-[#f0cd8a] via-[#d9a648] to-[#a34054] bg-clip-text text-transparent">
                story
              </span>
              . Find yours.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-[#a08b94] sm:text-lg">
              Search hundreds of recipes, save the ones you love, and let the god of wine
              settle the debate about what to pour tonight.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-9 flex max-w-2xl items-center gap-3"
          >
            <div className="group relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a08b94] transition-colors group-focus-within:text-[#d9a648]" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Search cocktails"
                placeholder="Try &quot;margarita&quot;, &quot;mojito&quot;, &quot;coffee&quot;… — or press /"
                className="h-14 rounded-2xl border-[#3a2330] bg-[#1d1118]/90 pl-12 pr-12 text-base shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] transition-all placeholder:text-[#6d5a63] focus-visible:border-[#d9a648]/60 focus-visible:ring-[#d9a648]/20"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#a08b94] transition-colors hover:bg-[#2a1923] hover:text-[#f3e9e2]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {(searching || loading) && (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#d9a648]" />
            )}
          </motion.div>
        </section>

        {/* Drink of the day */}
        {isBrowsing && drinkOfDay && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-12"
          >
            <button
              onClick={() => openDetail(drinkOfDay)}
              className="group grid w-full overflow-hidden rounded-3xl border border-[#d9a648]/25 bg-gradient-to-br from-[#241318] via-[#1d1118] to-[#1d1420] text-left shadow-[0_20px_60px_-20px_rgba(217,166,72,0.2)] transition-all hover:border-[#d9a648]/50 md:grid-cols-[320px_1fr]"
            >
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-full">
                <img
                  src={drinkOfDay.strDrinkThumb}
                  alt={drinkOfDay.strDrink}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1d1118]/60 max-md:bg-gradient-to-t" />
              </div>
              <div className="flex flex-col justify-center gap-3 p-7 sm:p-9">
                <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a648]">
                  <Citrus className="h-4 w-4" /> Chosen by fate today
                </span>
                <h2 className="font-display text-2xl font-bold text-[#f3e9e2] transition-colors group-hover:text-[#f0cd8a] sm:text-3xl">
                  {drinkOfDay.strDrink}
                </h2>
                <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-[#a08b94]">
                  {drinkOfDay.strInstructions || 'A classic worth rediscovering tonight.'}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {drinkOfDay.strCategory && (
                    <Badge variant="outline" className="border-[#3a2330] text-[#a08b94]">
                      {drinkOfDay.strCategory}
                    </Badge>
                  )}
                  {drinkOfDay.strGlass && (
                    <Badge variant="outline" className="border-[#3a2330] text-[#a08b94]">
                      {drinkOfDay.strGlass}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          </motion.section>
        )}

        {/* Filters */}
        <section ref={resultsRef} className="scroll-mt-24">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#f3e9e2]">
              {isBrowsing ? 'The classics' : `Results for “${query.trim()}”`}
              <span className="ml-2 text-sm font-normal text-[#a08b94]">
                {visible.length} {visible.length === 1 ? 'drink' : 'drinks'}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOnlyZeroProof((v) => !v)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  onlyZeroProof
                    ? 'border-[#7fc8a9]/60 bg-[#12352a] text-[#8fe3bd]'
                    : 'border-[#3a2330] text-[#a08b94] hover:border-[#7fc8a9]/40 hover:text-[#8fe3bd]'
                }`}
              >
                Zero-proof only
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(activeCategory === c ? null : c)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === c
                      ? 'border-[#d9a648]/60 bg-[#d9a648]/15 text-[#f0cd8a]'
                      : 'border-[#3a2330] text-[#a08b94] hover:border-[#d9a648]/40 hover:text-[#f0cd8a]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : visible.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md rounded-3xl border border-dashed border-[#3a2330] bg-[#1d1118]/60 px-8 py-16 text-center"
            >
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2a1923]">
                <Martini className="h-8 w-8 text-[#a08b94]" />
              </span>
              <h3 className="font-display text-xl font-semibold">
                {onlyFavorites ? 'No favorites yet' : 'Nothing in the cellar'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a08b94]">
                {onlyFavorites
                  ? 'Tap the heart on any drink to keep it here for later.'
                  : `We couldn't find anything${query.trim() ? ` for “${query.trim()}”` : ''}. Try another name — or let fate decide.`}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {!onlyFavorites && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={surpriseMe}
                    className="rounded-full border-[#d9a648]/40 text-[#f0cd8a] hover:bg-[#d9a648]/10"
                  >
                    <Shuffle className="mr-1 h-4 w-4" /> Surprise me
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setQuery('');
                    setActiveCategory(null);
                    setOnlyZeroProof(false);
                    setOnlyFavorites(false);
                  }}
                  className="rounded-full text-[#a08b94] hover:text-[#f3e9e2]"
                >
                  Reset everything
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {visible.map((d, i) => (
                  <DrinkCard
                    key={d.idDrink}
                    drink={d}
                    index={i}
                    isFavorite={isFavorite(d.idDrink)}
                    onToggleFavorite={toggleFavorite}
                    onOpen={openDetail}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* Footer (sticky bottom via flex layout) */}
      <footer className="relative z-10 mt-auto border-t border-[#3a2330]/70 bg-[#0e070b]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-[#6d5a63] sm:flex-row sm:px-6">
          <p>
            <span className="font-display font-semibold text-[#a08b94]">Dionysus</span> — built
            agentic, iterated with intent.
          </p>
          <p>Data from TheCocktailDB · Team Dionysus</p>
        </div>
      </footer>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto border-[#3a2330] bg-[#1d1118] p-0 text-[#f3e9e2] sm:max-w-2xl">
          {selected && (
            <div className="relative">
              <div className="relative h-56 overflow-hidden sm:h-64">
                <img
                  src={selected.strDrinkThumb}
                  alt={selected.strDrink}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1118] via-[#1d1118]/30 to-transparent" />
                <button
                  aria-label="Toggle favorite"
                  onClick={() => toggleFavorite(selected)}
                  className={`absolute right-4 top-4 rounded-full border p-2.5 backdrop-blur transition-all active:scale-90 ${
                    isFavorite(selected.idDrink)
                      ? 'border-[#a34054] bg-[#a34054]/90 text-white'
                      : 'border-white/20 bg-black/40 text-white/80 hover:text-[#e88fa2]'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(selected.idDrink) ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <DialogTitle asChild>
                    <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg">
                      {selected.strDrink}
                    </h2>
                  </DialogTitle>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  {[
                    detail?.strCategory || selected.strCategory,
                    detail?.strAlcoholic || selected.strAlcoholic,
                    detail?.strGlass || selected.strGlass,
                  ]
                    .filter(Boolean)
                    .map((chip) => (
                      <Badge key={chip} className="border-[#3a2330] bg-[#2a1923] font-normal text-[#c9b3bc]">
                        {chip}
                      </Badge>
                    ))}
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#d9a648]">
                    <Martini className="h-4 w-4" /> Ingredients
                  </h3>
                  {detailLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-2/3 bg-[#2a1923]" />
                      ))}
                    </div>
                  ) : detail ? (
                    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {extractIngredients(detail).map((ing) => (
                        <li key={ing.name} className="flex items-baseline justify-between gap-3 border-b border-[#2a1923] pb-1.5 text-sm">
                          <span className="text-[#f3e9e2]">{ing.name}</span>
                          <span className="shrink-0 text-xs text-[#a08b94]">{ing.measure}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#a08b94]">Ingredient list unavailable.</p>
                  )}
                </div>

                {detail?.strInstructions && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#d9a648]">
                      <GlassWater className="h-4 w-4" /> How to mix
                    </h3>
                    <p className="text-sm leading-relaxed text-[#c9b3bc]">{detail.strInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
