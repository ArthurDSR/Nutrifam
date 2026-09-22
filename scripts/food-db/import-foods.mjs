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

const usdaTranslations = [
  [/\brice, brown\b/gi, 'arroz integral'], [/\brice, white\b/gi, 'arroz branco'],
  [/\brice, black\b/gi, 'arroz negro'], [/\brice, red\b/gi, 'arroz vermelho'],
  [/\bapplesauce\b/gi, 'purê de maçã'], [/\bcanned in olive oil\b/gi, 'enlatado em azeite'],
  [/\bwith added vitamin c\b/gi, 'com vitamina C adicionada'],
  [/\brolled, old fashioned\b/gi, 'em flocos tradicionais'], [/\bsteel cut\b/gi, 'cortada em grãos'],
  [/\bripe and slightly ripe\b/gi, 'madura e levemente madura'], [/\boverripe\b/gi, 'muito madura'],
  [/\balmond milk\b/gi, 'bebida de amêndoas'], [/\boat milk\b/gi, 'bebida de aveia'],
  [/\balmond butter\b/gi, 'pasta de amêndoas'], [/\bpeanut butter\b/gi, 'pasta de amendoim'],
  [/\bblack beans\b/gi, 'feijão preto'], [/\bkidney beans\b/gi, 'feijão vermelho'],
  [/\bgreen beans\b/gi, 'vagem'], [/\bsweet potatoes\b/gi, 'batata-doce'],
  [/\bbrussels sprouts\b/gi, 'couve-de-bruxelas'], [/\bbeet greens\b/gi, 'folhas de beterraba'],
  [/\bcollard greens\b/gi, 'couve'], [/\bwhole grain\b/gi, 'integral'],
  [/\braw\b/gi, 'cru'], [/\bcooked\b/gi, 'cozido'], [/\broasted\b/gi, 'assado'],
  [/\bboiled\b/gi, 'cozido'], [/\bfried\b/gi, 'frito'], [/\bwithout salt\b/gi, 'sem sal'],
  [/\bwith salt\b/gi, 'com sal'], [/\bskinless\b/gi, 'sem pele'], [/\bboneless\b/gi, 'sem osso'],
  [/\bwithout skin\b/gi, 'sem casca'], [/\bwith skin\b/gi, 'com casca'],
  [/\bunsweetened\b/gi, 'sem açúcar'], [/\bsweetened\b/gi, 'adoçado'], [/\bplain\b/gi, 'natural'],
  [/\brefrigerated\b/gi, 'refrigerado'], [/\bshelf stable\b/gi, 'longa vida'],
  [/\bcanned\b/gi, 'enlatado'], [/\bdrained\b/gi, 'drenado'], [/\bdry\b/gi, 'seco'],
  [/\bfrozen\b/gi, 'congelado'], [/\bpeeled\b/gi, 'descascado'], [/\bsliced\b/gi, 'fatiado'],
  [/\blong grain\b/gi, 'grão longo'], [/\bunenriched\b/gi, 'não enriquecido'],
  [/\bgreen\b/gi, 'verde'], [/\bwhite\b/gi, 'branco'], [/\bred\b/gi, 'vermelho'],
  [/\bblack\b/gi, 'preto'], [/\bbaby\b/gi, 'jovem'], [/\bfresh\b/gi, 'fresco'],
  [/\bground\b/gi, 'moído'], [/\blean\b/gi, 'magro'], [/\bbreast\b/gi, 'peito'],
  [/\bthigh\b/gi, 'coxa'], [/\bdrumstick\b/gi, 'coxa inferior'], [/\bmeat\b/gi, 'carne'],
  [/\bskin\b/gi, 'pele'], [/\bolive oil\b/gi, 'azeite'], [/\bsoybean oil\b/gi, 'óleo de soja'],
  [/\btomatoes?\b/gi, 'tomate'], [/\bpotatoes?\b/gi, 'batata'], [/\bonions?\b/gi, 'cebola'],
  [/\bcarrots?\b/gi, 'cenoura'], [/\bapples?\b/gi, 'maçã'], [/\bbananas?\b/gi, 'banana'],
  [/\boranges?\b/gi, 'laranja'], [/\bstrawberries\b/gi, 'morango'], [/\bgrapes?\b/gi, 'uva'],
  [/\bbeans?\b/gi, 'feijão'], [/\brice\b/gi, 'arroz'], [/\boats?\b/gi, 'aveia'],
  [/\bchicken\b/gi, 'frango'], [/\bbeef\b/gi, 'carne bovina'], [/\bpork\b/gi, 'carne suína'],
  [/\bfish\b/gi, 'peixe'], [/\beggs?\b/gi, 'ovo'], [/\bmilk\b/gi, 'leite'],
  [/\bcheese\b/gi, 'queijo'], [/\byogurt\b/gi, 'iogurte'], [/\bbutter\b/gi, 'manteiga'],
  [/\bbroccoli\b/gi, 'brócolis'], [/\bspinach\b/gi, 'espinafre'], [/\bavocado\b/gi, 'abacate'],
  [/\bhummus\b/gi, 'homus'], [/\bcommercial\b/gi, 'industrializado'],
  [/\bapricot\b/gi, 'damasco'], [/\barugula\b/gi, 'rúcula'], [/\basparagus\b/gi, 'aspargo'],
  [/\bbeets\b/gi, 'beterraba'], [/\bblackberries\b/gi, 'amora'], [/\bblueberries\b/gi, 'mirtilo'],
  [/\banchovies\b/gi, 'anchova'], [/\bbulgur\b/gi, 'trigo para quibe']
];

const translateUsdaDescription = (description) => {
  let translated = String(description || '');
  for (const [pattern, replacement] of usdaTranslations) translated = translated.replace(pattern, replacement);
  return translated.replace(/\s+,/g, ',').trim();
};

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
  const originalName = String(first(row, aliases.name) || '').trim();
  const name = source === 'usda' ? translateUsdaDescription(originalName) : originalName;
  const brand = String(first(row, aliases.brand) || '').trim();
  const barcode = String(first(row, aliases.barcode) || '').replace(/\D/g, '');
  const servingGrams = number(first(row, aliases.servingGrams)) || 100;
  const sourceId = String(first(row, aliases.id) || `${index + 1}`);
  const hash = createHash('sha1').update(`${source}:${sourceId}:${name}:${brand}`).digest('hex').slice(0, 12);
  const nova = Math.round(number(first(row, aliases.novaGroup)));

  const usdaNutrients = Array.isArray(row.foodNutrients) ? row.foodNutrients : [];
  const nutrient = (names, fallbackAliases, unit) => {
    for (const entry of usdaNutrients) {
      const nutrientName = normalizeText(entry.nutrient?.name || entry.nutrientName);
      const nutrientUnit = normalizeText(entry.nutrient?.unitName || entry.unitName);
      if (names.includes(nutrientName) && (!unit || nutrientUnit === unit)) {
        return number(entry.amount ?? entry.value);
      }
    }
    return number(first(row, fallbackAliases));
  };

  const hasUsdaNutrient = (names) => usdaNutrients.some((entry) =>
    names.includes(normalizeText(entry.nutrient?.name || entry.nutrientName))
  );
  const cleanNutrient = (value) => value < 0 && value >= -0.1 ? 0 : value;

  const proteinNames = ['protein'];
  const carbNames = ['carbohydrate by difference', 'carbohydrate'];
  const fatNames = ['total lipid fat', 'total fat'];
  const protein = cleanNutrient(nutrient(proteinNames, aliases.protein));
  const carbs = cleanNutrient(nutrient(carbNames, aliases.carbs));
  const fat = cleanNutrient(nutrient(fatNames, aliases.fat));
  const officialCalories = nutrient(['energy', 'energy kcal'], aliases.calories, 'kcal');
  const hasCompleteMacros = source !== 'usda'
    || (hasUsdaNutrient(proteinNames) && hasUsdaNutrient(carbNames) && hasUsdaNutrient(fatNames));
  const calories = officialCalories > 0
    ? officialCalories
    : hasCompleteMacros ? Math.round(protein * 4 + carbs * 4 + fat * 9) : 0;
  const categoryDescription = normalizeText(row.foodCategory?.description || '');
  const foodGroup = categoryDescription.includes('fruit') ? 'fruit'
    : categoryDescription.includes('vegetable') ? 'vegetable'
      : categoryDescription.includes('dairy') ? 'dairy'
        : categoryDescription.includes('legume') ? 'legume'
          : categoryDescription.includes('nut') || categoryDescription.includes('seed') ? 'nuts_seeds'
            : categoryDescription.includes('cereal') || categoryDescription.includes('grain') ? 'grain'
              : categoryDescription.includes('meat') || categoryDescription.includes('poultry') || categoryDescription.includes('fish') ? 'protein'
                : categoryDescription.includes('fat') || categoryDescription.includes('oil') ? 'fat_oil'
                  : 'other';

  const recipeIngredients = Array.isArray(row.recipeIngredients) ? row.recipeIngredients : undefined;
  const recipeYieldPortions = number(row.recipeYieldPortions);
  return {
    id: `import_${source}_${hash}`,
    name,
    ...(brand ? { brand } : {}),
    calories,
    energySource: officialCalories > 0 ? 'analytical' : 'calculated_4_4_9',
    servingSize: String(first(row, aliases.servingSize) || `${servingGrams} g`),
    servingGrams,
    protein,
    carbs,
    fat,
    fiber: nutrient(['fiber total dietary', 'dietary fiber'], aliases.fiber),
    ...(barcode.length >= 8 ? { barcode } : {}),
    ...(nova >= 1 && nova <= 4 ? { novaGroup: nova } : {}),
    category: 'Food',
    foodGroup,
    catalogSource: source === 'manufacturer' ? 'manufacturer' : source,
    normalizedName: normalizeText(`${name} ${brand}`),
    verificationStatus: source === 'manufacturer' ? 'pending' : 'verified',
    ...(source === 'usda' && originalName !== name ? { sourceName: originalName } : {}),
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
  else if (!food.calories) errors.push('energia ausente e macronutrientes incompletos');
  if (source === 'manufacturer' && (!food.brand || !food.barcode)) {
    errors.push('produto de fabricante exige marca e código de barras');
  }
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
const rows = Array.isArray(parsed) ? parsed : parsed.foods || parsed.FoundationFoods;
if (!Array.isArray(rows)) throw new Error('O arquivo deve conter uma lista de alimentos.');
const usableRows = rows.filter((row) => row && typeof row === 'object');

const accepted = [];
const rejected = [];
const duplicateKeys = new Set();
usableRows.forEach((row, index) => {
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
// Each import is a snapshot replacement for its source. This prevents stale
// records from surviving when normalization or validation rules evolve.
existing = existing.filter((food) => food.catalogSource !== source);
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
const groupCoverage = Object.fromEntries(
  [...new Set(catalog.map((food) => food.foodGroup || 'unclassified'))]
    .sort()
    .map((group) => [group, catalog.filter((food) => (food.foodGroup || 'unclassified') === group).length])
);
const report = {
  generatedAt: new Date().toISOString(),
  source,
  input: path.relative(process.cwd(), inputPath).replace(/\\/g, '/'),
  received: usableRows.length,
  accepted: accepted.length,
  rejected: rejected.length,
  catalogTotal: catalog.length,
  policyVersion: catalogPolicy.policyVersion,
  quality: {
    zeroCalories: catalog.filter((food) => !food.calories).length,
    analyticalEnergy: catalog.filter((food) => food.energySource === 'analytical').length,
    calculatedEnergy: catalog.filter((food) => food.energySource === 'calculated_4_4_9').length,
    groupCoverage
  },
  rejectionDetails: rejected.slice(0, 1000)
};

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Importação concluída: ${accepted.length} aceitos, ${rejected.length} rejeitados, ${catalog.length} no catálogo gerado.`);
