import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCOUNT_WILLING, DISCOUNT_OFFER, NEEDS, MAX_NEEDS, cleanAliada, type AliadaFields, type Need } from "@/lib/mesas-aliadas";

export const EMPTY_ALIADA: AliadaFields = {
  discount_willing: null, discount_offer: null, discount_offer_other: null,
  participation_needs: null, participation_needs_other: null, wants_founder: null,
};

const chip = (on: boolean) =>
  on
    ? "rounded-md border border-[#54b678] bg-[#54b678] px-3 py-1.5 text-sm text-white transition-colors"
    : "rounded-md border border-[#18253f]/20 bg-white px-3 py-1.5 text-sm text-[#18253f] transition-colors hover:border-[#54b678]";

/** Sección opcional "Mesas Aliadas RutaLover". Se usa en el formulario público y en el admin. */
export function MesasAliadasFields({ value, onChange, idPrefix = "ma" }: { value: AliadaFields; onChange: (v: AliadaFields) => void; idPrefix?: string }) {
  const set = (patch: Partial<AliadaFields>) => onChange({ ...value, ...patch });
  const w = value.discount_willing;
  const open = w === "si" || w === "tal_vez";
  const needs = value.participation_needs ?? [];
  const toggleNeed = (n: Need) => {
    const next = needs.includes(n) ? needs.filter((x) => x !== n) : needs.length >= MAX_NEEDS ? needs : [...needs, n];
    set({ participation_needs: next });
  };
  return (
    <div className="space-y-4">
      <div>
        <Label>¿Ofrecerías un descuento a miembros de RutaLover a cambio de más visitas?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DISCOUNT_WILLING.map((o) => (
            <button key={o.v} type="button" aria-pressed={w === o.v} className={chip(w === o.v)}
              onClick={() => onChange(cleanAliada({ ...value, discount_willing: w === o.v ? null : o.v }))}>{o.l}</button>
          ))}
        </div>
      </div>
      {open && (
        <>
          <div>
            <Label>¿Qué descuento podrías ofrecer?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DISCOUNT_OFFER.map((o) => (
                <button key={o.v} type="button" aria-pressed={value.discount_offer === o.v} className={chip(value.discount_offer === o.v)}
                  onClick={() => set({ discount_offer: value.discount_offer === o.v ? null : o.v })}>{o.l}</button>
              ))}
            </div>
            {value.discount_offer === "otro" && (
              <Input id={`${idPrefix}-oferta`} className="mt-2" maxLength={200} placeholder="Describe tu oferta"
                value={value.discount_offer_other ?? ""} onChange={(e) => set({ discount_offer_other: e.target.value })} />
            )}
          </div>
          <div>
            <Label>¿Qué necesitarías para participar? <span className="font-normal text-[#18253f]/60">(escoge hasta 3)</span></Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {NEEDS.map((o) => (
                <button key={o.v} type="button" aria-pressed={needs.includes(o.v)} className={chip(needs.includes(o.v))}
                  disabled={!needs.includes(o.v) && needs.length >= MAX_NEEDS} onClick={() => toggleNeed(o.v)}>{o.l}</button>
              ))}
            </div>
            {needs.includes("otro") && (
              <Input id={`${idPrefix}-necesidad`} className="mt-2" maxLength={200} placeholder="¿Qué más necesitarías?"
                value={value.participation_needs_other ?? ""} onChange={(e) => set({ participation_needs_other: e.target.value })} />
            )}
          </div>
        </>
      )}
      {w === "si" && (
        <div>
          <Label>¿Quieres ser Mesa Aliada Fundadora?</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {([[true, "Sí"], [false, "No"]] as const).map(([v, l]) => (
              <button key={l} type="button" aria-pressed={value.wants_founder === v} className={chip(value.wants_founder === v)}
                onClick={() => set({ wants_founder: value.wants_founder === v ? null : v })}>{l}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
