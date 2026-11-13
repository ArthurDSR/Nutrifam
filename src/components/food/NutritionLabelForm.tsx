import { useRef, useState } from 'react';
import type { FoodItem } from '../../types';
import { labelFields, normalizeGtin, readLabelNumber, readNutritionLabel, type LabelDraft } from '../../services/nutritionLabelService';

const fields = { amount: 'Quantidade da coluna', calories: 'Energia (kcal)', protein: 'Proteínas (g)', carbs: 'Carboidratos (g)', fat: 'Gorduras totais (g)', fiber: 'Fibras (g)' };
const inputClass = 'mt-1 w-full rounded-xl border border-[#AEBDB5]/50 bg-white p-2 dark:bg-[#18201D]';
const actionClass = 'rounded-xl border border-[#AEBDB5]/50 px-3 py-2 font-bold disabled:opacity-50';

interface Props {
  barcode: string;
  foods: FoodItem[];
  vision: Parameters<typeof readNutritionLabel>[1];
  onSave: (food: FoodItem) => void;
  onClose: () => void;
}

export function NutritionLabelForm({ barcode, foods, vision, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<LabelDraft>({ name: '', brand: '', unit: 'g', amount: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
  const [code, setCode] = useState(barcode);
  const [confirmed, setConfirmed] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const update = (values: Partial<LabelDraft>) => {
    setDraft((previous) => ({ ...previous, ...values }));
    setConfirmed(false);
  };
  const readPhoto = async (file: File) => {
    setReading(true);
    setError('');
    setConfirmed(false);
    try {
      const parsed = await readNutritionLabel(file, vision);
      // Replacing the column must clear nutrients the reader couldn't see.
      update({ amount: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', ...parsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível ler a foto.');
    } finally {
      setReading(false);
    }
  };
  const save = () => {
    const gtin = normalizeGtin(code);
    const [amount, calories, protein, carbs, fat, fiber] = labelFields.map((field) => readLabelNumber(draft[field]));
    if (!gtin || !draft.name.trim() || !draft.brand.trim()) {
      setError('Preencha nome, marca e um código GTIN válido.');
      return;
    }
    if (![amount, calories, protein, carbs, fat, fiber].every(Number.isFinite) ||
        amount <= 0 || amount > 5000 || calories > amount * 10 ||
        [protein, carbs, fat, fiber].some((value) => value > amount)) {
      setError('Confira os valores da mesma coluna. Digite zero quando ele estiver indicado no rótulo.');
      return;
    }
    if (!confirmed || reading || saved) return;
    const existing = foods.find((food) => food.id.startsWith('label_') && food.barcode === gtin);
    onSave({
      id: existing?.id || `label_${crypto.randomUUID()}`, name: draft.name.trim(), brand: draft.brand.trim(),
      barcode: gtin, category: 'Food', catalogSource: 'user', energySource: 'label',
      servingSize: `${amount} ${draft.unit}`, servingGrams: amount, calories, protein, carbs, fat, fiber
    });
    setError('');
    setSaved(true);
  };
  return (
    <form className="min-h-0 flex-1 overflow-y-auto space-y-3 p-4 pb-10 text-sm text-[#3F4B46] dark:text-[#EDF2EF]"
      onSubmit={(event) => { event.preventDefault(); save(); }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">Cadastrar pelo rótulo</h3>
        <button type="button" className={actionClass} onClick={onClose} disabled={reading}>Voltar ao leitor</button>
      </div>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void readPhoto(file);
        }} />
      {vision.apiKey?.trim() && <div>
        <button type="button" className={actionClass} disabled={reading || saved} onClick={() => input.current?.click()}>
          {reading ? 'Lendo tabela…' : 'Fotografar tabela nutricional'}
        </button>
        <p className="mt-1 text-xs">A foto é enviada ao provedor de IA configurado.</p>
      </div>}
      {!vision.apiKey?.trim() && <p className="text-xs">Para preencher pela foto, configure uma chave de IA nas configurações do app.</p>}
      <p className="text-xs">Use todos os valores da mesma coluna da tabela. Você também pode preencher à mão.</p>
      <fieldset disabled={reading || saved} className="space-y-3">
        <label className="block">Código de barras
          <input className={inputClass} value={code} inputMode="numeric" onChange={(e) => { setCode(e.target.value); setConfirmed(false); }} />
        </label>
        <label className="block">Nome
          <input className={inputClass} value={draft.name} maxLength={150} onChange={(e) => update({ name: e.target.value })} />
        </label>
        <label className="block">Marca
          <input className={inputClass} value={draft.brand} maxLength={100} onChange={(e) => update({ brand: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          {labelFields.map((field) => <label key={field}>{fields[field]}
            <input className={inputClass} value={draft[field]} inputMode="decimal" onChange={(e) => update({ [field]: e.target.value })} />
          </label>)}
          <label>Unidade da coluna
            <select className={inputClass} value={draft.unit} onChange={(e) => update({ unit: e.target.value === 'ml' ? 'ml' : 'g' })}>
              <option value="g">g</option><option value="ml">ml</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> Conferi os valores no rótulo
        </label>
      </fieldset>
      {error && <p role="alert" className="text-red-700 dark:text-red-300">{error}</p>}
      {saved ? <div className="space-y-2">
        <p role="status">Produto salvo em Meus alimentos.</p>
        <button type="button" className={actionClass} onClick={onClose}>Cadastrar outro produto</button>
      </div> : <button type="submit" className={actionClass} disabled={reading || !confirmed}>Salvar produto</button>}
    </form>
  );
}
