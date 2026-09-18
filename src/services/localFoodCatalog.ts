import { BRAZILIAN_FOODS } from '../data/brazilianFoods';
import { TACO_FOODS } from '../data/tacoFoods';
import generatedFoods from '../data/generatedFoodCatalog.json';
import { FoodItem } from '../types';
import { isCatalogEligibleFood } from './foodCatalogPolicy';
import { normalizeCatalogText } from './localFoodCatalogText';

export const LOCAL_CATALOG_VERSION = '2026.09.4';

const DB_NAME = 'nutrifam-food-catalog';
const DB_VERSION = 1;
const FOOD_STORE = 'foods';
const META_STORE = 'metadata';

export type CatalogSource = 'taco' | 'brazilian' | 'manufacturer' | 'tbca' | 'usda' | 'canonical' | 'user';

export interface LocalCatalogFood extends FoodItem {
  catalogSource: CatalogSource;
  normalizedName: string;
  verificationStatus: 'verified' | 'pending' | 'user';
}

export { normalizeCatalogText } from './localFoodCatalogText';

const normalizeBarcode = (value?: string): string | undefined => {
  const digits = value?.replace(/\D/g, '');
  return digits && digits.length >= 8 ? digits : undefined;
};

const asCatalogFood = (food: FoodItem, catalogSource: CatalogSource): LocalCatalogFood => ({
  ...food,
  barcode: normalizeBarcode(food.barcode),
  catalogSource,
  normalizedName: normalizeCatalogText(`${food.name} ${food.brand || ''}`),
  verificationStatus: food.verificationStatus
    ?? (catalogSource === 'user' ? 'user' : catalogSource === 'manufacturer' ? 'pending' : 'verified')
});

const deduplicate = (foods: LocalCatalogFood[]): LocalCatalogFood[] => {
  const seen = new Set<string>();
  return foods.filter((food) => {
    const key = food.barcode
      ? `barcode:${food.barcode}`
      : `${food.normalizedName}:${food.servingGrams}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const STATIC_CATALOG = deduplicate([
  ...(generatedFoods as FoodItem[]).map((food) => asCatalogFood(food, (food.catalogSource || 'canonical') as CatalogSource)),
  ...TACO_FOODS.map((food) => asCatalogFood(food, 'taco')),
  ...BRAZILIAN_FOODS.map((food) => asCatalogFood(food, 'brazilian'))
].filter(isCatalogEligibleFood));

export const getLocalCatalogFoods = (): readonly LocalCatalogFood[] => STATIC_CATALOG;

export const findLocalFoodByBarcode = (barcode: string): LocalCatalogFood | undefined => {
  const normalized = normalizeBarcode(barcode);
  if (!normalized) return undefined;
  return STATIC_CATALOG.find((food) => food.barcode === normalized);
};

const openCatalogDb = (): Promise<IDBDatabase | null> => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FOOD_STORE)) {
        const store = db.createObjectStore(FOOD_STORE, { keyPath: 'id' });
        store.createIndex('barcode', 'barcode', { unique: false });
        store.createIndex('normalizedName', 'normalizedName', { unique: false });
        store.createIndex('catalogSource', 'catalogSource', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export async function initializeLocalFoodCatalog(): Promise<void> {
  const db = await openCatalogDb();
  if (!db) return;

  const currentVersion = await new Promise<string | undefined>((resolve, reject) => {
    const transaction = db.transaction(META_STORE, 'readonly');
    const request = transaction.objectStore(META_STORE).get('catalogVersion');
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
  if (currentVersion === LOCAL_CATALOG_VERSION) {
    db.close();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([FOOD_STORE, META_STORE], 'readwrite');
    const foods = transaction.objectStore(FOOD_STORE);
    foods.clear();
    STATIC_CATALOG.forEach((food) => foods.put(food));
    transaction.objectStore(META_STORE).put({ key: 'catalogVersion', value: LOCAL_CATALOG_VERSION });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
