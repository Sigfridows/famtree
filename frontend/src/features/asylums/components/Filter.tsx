'use client';
import { useEffect, useState } from 'react';
import { getAsylumCatalogs } from '../api/discovery';
import type { AsylumCatalogs } from '../types/asylum.types';

export interface FilterData {
  type?: string; services?: number[]; careTypes?: number[]; minPrice?: number; maxPrice?: number;
  province?: number; municipality?: number; certifiedOnly?: boolean; minRating?: number;
}
interface Props {isOpen?: boolean; onClose?: () => void; onApply?: (filters: FilterData) => void; servicesList?: string[]}
export default function FilterModal({isOpen, onClose, onApply}: Props) {
  const [catalogs, setCatalogs] = useState<AsylumCatalogs | null>(null);
  const [draft, setDraft] = useState<FilterData>({});
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getAsylumCatalogs(undefined, controller.signal).then(setCatalogs).catch(() => {if (!controller.signal.aborted) setError('No se pudieron cargar los filtros. Cierra y vuelve a intentarlo.');});
    return () => controller.abort();
  }, []);
  if (!isOpen) return null;
  const inputClass = 'w-full rounded-xl border border-zinc-600 bg-zinc-900 p-2 text-sm text-white';
  const toggle = (key: 'services' | 'careTypes', id: number) => setDraft(previous => ({...previous, [key]: previous[key]?.includes(id) ? previous[key]!.filter(value => value !== id) : [...previous[key] ?? [], id]}));
  const apply = () => {
    if (draft.minPrice !== undefined && draft.maxPrice !== undefined && draft.minPrice > draft.maxPrice) {setError('El precio mínimo no puede superar el máximo.'); return;}
    setError(''); onApply?.(draft); onClose?.();
  };
  return <>
    <div className="fixed inset-0 z-40" onClick={onClose} />
    <section role="dialog" aria-label="Filtros de residencias" className="absolute right-0 top-full z-50 mt-2 max-h-[75vh] w-[min(92vw,620px)] overflow-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 text-white shadow-2xl">
      <div className="mb-4 flex justify-between"><h2 className="font-bold">Filtros</h2><button type="button" aria-label="Cerrar filtros" onClick={onClose}>Cerrar</button></div>
      {error && <p role="alert" className="mb-3 text-sm text-amber-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>Tipo de propiedad<select aria-label="Tipo de propiedad" className={inputClass} value={draft.type ?? ''} onChange={event => setDraft({...draft, type: event.target.value || undefined})}><option value="">Todos</option>{['CASA','APARTAMENTO','VILLA','GERIATRICO'].map(type => <option key={type}>{type}</option>)}</select></label>
        <label>Calificación mínima<select aria-label="Calificación mínima" className={inputClass} value={draft.minRating ?? ''} onChange={event => setDraft({...draft, minRating: event.target.value ? Number(event.target.value) : undefined})}><option value="">Todas</option>{[1,2,3,4,5].map(rating => <option key={rating} value={rating}>{rating} estrellas o más</option>)}</select></label>
        <label>Precio mínimo (DOP)<input aria-label="Precio mínimo (DOP)" className={inputClass} type="number" min="0" step="0.01" value={draft.minPrice ?? ''} onChange={event => setDraft({...draft, minPrice: event.target.value ? Number(event.target.value) : undefined})} /></label>
        <label>Precio máximo (DOP)<input aria-label="Precio máximo (DOP)" className={inputClass} type="number" min="0" step="0.01" value={draft.maxPrice ?? ''} onChange={event => setDraft({...draft, maxPrice: event.target.value ? Number(event.target.value) : undefined})} /></label>
        <label>Provincia<select aria-label="Provincia" className={inputClass} value={draft.province ?? ''} onChange={event => setDraft({...draft, province: Number(event.target.value) || undefined, municipality: undefined})}><option value="">Todas</option>{catalogs?.provinces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Municipio<select aria-label="Municipio" className={inputClass} value={draft.municipality ?? ''} onChange={event => setDraft({...draft, municipality: Number(event.target.value) || undefined})}><option value="">Todos</option>{catalogs?.municipalities.filter(item => !draft.province || item.province_id === draft.province).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <fieldset className="space-y-2"><legend className="mb-2 font-semibold">Tipo de adulto mayor</legend>{catalogs?.care_types.map(item => <label className="flex gap-2 text-sm" key={item.id}><input type="checkbox" checked={draft.careTypes?.includes(item.id) ?? false} onChange={() => toggle('careTypes', item.id)} />{item.name}</label>)}</fieldset>
        <fieldset className="space-y-2"><legend className="mb-2 font-semibold">Servicios incluidos</legend>{catalogs?.services.map(item => <label className="flex gap-2 text-sm" key={item.id}><input type="checkbox" checked={draft.services?.includes(item.id) ?? false} onChange={() => toggle('services', item.id)} />{item.name}</label>)}</fieldset>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.certifiedOnly ?? false} onChange={event => setDraft({...draft, certifiedOnly: event.target.checked})} />Solo centros con certificaciones declaradas</label>
      </div>
      <footer className="sticky bottom-0 mt-4 flex justify-between bg-zinc-950 py-3"><button type="button" onClick={() => {setDraft({}); setError(''); onApply?.({});}}>Restablecer</button><button type="button" className="rounded-xl bg-[#CCDD99] px-4 py-2 font-bold text-zinc-950" onClick={apply}>Aplicar selección</button></footer>
    </section>
  </>;
}
