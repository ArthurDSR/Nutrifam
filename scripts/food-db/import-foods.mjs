import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  })
);

if (!args.input) {
  console.error('Uso: npm run food-db:import -- --input=caminho.csv --source=manufacturer');
  process.exit(1);
}

const source = String(args.source || 'canonical').toLowerCase();
const supportedSources = new Set(['canonical', 'tbca', 'usda', 'manufacturer']);
if (!supportedSources.has(source)) {
  console.error(`Fonte inválida: ${source}. Use canonical, tbca, usda ou manufacturer.`);
  process.exit(1);
}
const inputPath = path.resolve(String(args.input));
const outputPath = path.resolve(String(args.output || 'src/data/generatedFoodCatalog.json'));
const reportPath = path.resolve(String(args.report || 'data/food-sources/import-report.json'));
const policyPath = path.resolve('src/data/catalogPolicy.json');
const catalogPolicy = JSON.parse(await readFile(policyPath, 'utf8'));

const normalizeText = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const number = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? '').trim().replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const first = (row, names) => {
  for (const name of names) {
    const value = row[name];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
};

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.trim());
    rows.push(row);
  }
  const headers = (rows.shift() || []).map((header) => normalizeText(header).replace(/ /g, '_'));
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
}

const aliases = {
  name: ['name', 'nome', 'description', 'descricao', 'descricao_do_alimento', 'produto'],
  brand: ['brand', 'marca', 'brandOwner', 'brand_owner', 'fabricante'],
  barcode: ['barcode', 'codigo_de_barras', 'gtinUpc', 'gtin', 'ean', 'upc'],
  calories: ['calories', 'kcal', 'energia_kcal', 'energy_kcal', 'energy_kcal_100g'],
  protein: ['protein', 'proteina', 'proteinas', 'protein_100g'],
  carbs: ['carbs', 'carboidratos', 'carbohydrate', 'carbohydrates_100g'],
  fat: ['fat', 'gordura', 'gorduras_totais', 'total_fat', 'fat_100g'],
  fiber: ['fiber', 'fibra', 'fibra_alimentar', 'fiber_100g'],
  servingGrams: ['servingGrams', 'serving_grams', 'porcao_g', 'gramas_da_porcao', 'serving_size'],
  servingSize: ['servingSize', 'serving_label', 'porcao', 'medida_caseira'],
  novaGroup: ['novaGroup', 'nova_group', 'grupo_nova'],
  category: ['category', 'categoria'],
  id: ['id', 'fdcId', 'fdc_id', 'source_id', 'codigo']
};

function mapRow(row, index) {
  const name = String(first(row, aliases.name) || '').trim();
  const brand = String(first(row, aliases.brand) || '').trim();
  const barcode = String(first(row, aliases.barcode) || '').replace(/\D/g, '');
  const servingGrams = number(first(row, aliases.servingGrams)) || 100;
  const sourceId = String(first(row, aliases.id) || `${index + 1}`);
  const hash = createHash('sha1').update(`${source}:${sourceId}:${name}:${brand}`).digest('hex').slice(0, 12);
  const nova = Math.round(number(first(row, aliases.novaGroup)));

  const usdaNutrients = Array.isArray(row.foodNutrients)
    ? Object.fromEntries(row.foodNutrients.map((entry) => [normalizeText(entry.nutrient?.name || entry.nutrientName), entry.amount ?? entry.value]))
    : {};
  const nutrient = (names, fallbackAliases) => {
    for (const name of names) {
      if (usdaNutrients[name] !== undefined) return number(usdaNutrients[name]);
    }
    return number(first(row, fallbackAliases));
  };

  const recipeIngredients = Array.isArray(row.recipeIngredients) ? row.recipeIngredients : undefined;
  const recipeYieldPortions = number(row.recipeYieldPortions);
  return {
    id: `import_${source}_${hash}`,
    name,
    ...(brand ? { brand } : {}),
    calories: nutrient(['energy', 'energy kcal'], aliases.calories),
    servingSize: String(first(row, aliases.servingSize) || `${servingGrams} g`),
    servingGrams,
    protein: nutrient(['protein'], aliases.protein),
    carbs: nutrient(['carbohydrate by difference', 'carbohydrate'], aliases.carbs),
    fat: nutrient(['total lipid fat', 'total fat'], aliases.fat),
    fiber: nutrient(['fiber total dietary', 'dietary fiber'], aliases.fiber),
    ...(barcode.length >= 8 ? { barcode } : {}),
    ...(nova >= 1 && nova <= 4 ? { novaGroup: nova } : {}),
    category: 'Food',
    catalogSource: source === 'manufacturer' ? 'manufacturer' : source,
    normalizedName: normalizeText(`${name} ${brand}`),
    verificationStatus: source === 'manufacturer' ? 'pending' : 'verified',
    ...(row.isRecipe === true && recipeIngredients?.length && recipeYieldPortions > 0
      ? { isRecipe: true, recipeIngredients, recipeYieldPortions }
      : {})
  };
}

const isCompositeDish = (food) => {
  const normalized = ` ${normalizeText(food.name)} `;
  return catalogPolicy.compositeDishTerms.some((term) => normalized.includes(` ${term} `));
};

function validate(food) {
  const errors = [];
  if (food.name.length < 2) errors.push('nome ausente');
  if (food.servingGrams <= 0 || food.servingGrams > 5000) errors.push('porção inválida');
  for (const field of ['calories', 'protein', 'carbs', 'fat', 'fiber']) {
    if (food[field] < 0) errors.push(`${field} negativo`);
  }
  const factor = 100 / food.servingGrams;
  if (food.calories * factor > 1000) errors.push('calorias acima de 1000 kcal/100g');
  if (food.protein * factor > 100 || food.carbs * factor > 100 || food.fat * factor > 100 || food.fiber * factor > 100) {
    errors.push('macronutriente acima de 100g/100g');
  }
  if (!food.calories && !food.protein && !food.carbs && !food.fat && !food.fiber) errors.push('sem dados nutricionais');
  if (isCompositeDish(food)) {
    const completeRecipe = food.isRecipe && food.recipeYieldPortions > 0 && food.recipeIngredients?.length;
    const identifiedPackage = food.barcode && food.brand;
    if (!completeRecipe && !identifiedPackage) {
      errors.push('preparação composta sem receita completa ou produto embalado com marca e código de barras');
    }
  }
  return errors;
}

const raw = await readFile(inputPath, 'utf8');
const parsed = inputPath.toLowerCase().endsWith('.json')
  ? JSON.parse(raw)
  : parseCsv(raw.replace(/^\uFEFF/, ''));
const rows = Array.isArray(parsed) ? parsed : parsed.foods;
if (!Array.isArray(rows)) throw new Error('O arquivo deve conter uma lista de alimentos.');

const accepted = [];
const rejected = [];
const duplicateKeys = new Set();
rows.forEach((row, index) => {
  const food = mapRow(row, index);
  const errors = validate(food);
  const key = food.barcode ? `barcode:${food.barcode}` : `${food.normalizedName}:${food.servingGrams}`;
  if (duplicateKeys.has(key)) errors.push('duplicado no arquivo');
  if (errors.length) rejected.push({ row: index + 2, name: food.name, errors });
  else {
    duplicateKeys.add(key);
    accepted.push(food);
  }
});

let existing = [];
try {
  existing = JSON.parse(await readFile(outputPath, 'utf8'));
} catch {}
const merged = new Map();
for (const food of [...existing, ...accepted]) {
  const compositeAllowed = !isCompositeDish(food)
    || (food.isRecipe && food.recipeYieldPortions > 0 && food.recipeIngredients?.length)
    || (food.barcode && food.brand);
  if (!compositeAllowed) continue;
  const key = food.barcode ? `barcode:${food.barcode}` : `${food.normalizedName}:${food.servingGrams}`;
  merged.set(key, food);
}
const catalog = [...merged.values()].sort((a, b) => a.normalizedName.localeCompare(b.normalizedName, 'pt-BR'));
const report = {
  generatedAt: new Date().toISOString(),
  source,
  input: inputPath,
  received: rows.length,
  accepted: accepted.length,
  rejected: rejected.length,
  catalogTotal: catalog.length,
  policyVersion: catalogPolicy.policyVersion,
  rejectionDetails: rejected.slice(0, 1000)
};

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Importação concluída: ${accepted.length} aceitos, ${rejected.length} rejeitados, ${catalog.length} no catálogo gerado.`);
