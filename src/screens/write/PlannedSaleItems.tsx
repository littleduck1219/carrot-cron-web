import { ActionButton } from '@seed-design/react';
import { validQuantity, type SaleItem } from './saleItems';

export function PlannedSaleItems({ items, giveaway, onChange }: { items: SaleItem[]; giveaway: boolean; onChange: (items: SaleItem[]) => void }) {
    const update = (id: string, patch: Partial<SaleItem>) => onChange(items.map(item => item.id === id ? { ...item, ...patch } : item));
    const focusName = (id: string) => requestAnimationFrame(() => document.getElementById(`sale-name-${id}`)?.focus());
    const addItem = () => {
        const id = `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        onChange([...items, { id, name: '', price: '', quantity: null }]);
        focusName(id);
    };
    return <div className="planned-sale-items">
        <p className="sale-items-help">가격은 1개 기준이에요.</p>
        {items.map((item, index) => <section className="sale-item-card" key={item.id} aria-label={`물품 ${index + 1}`}>
            <div className="sale-item-top">
                <input className="sale-item-name" id={`sale-name-${item.id}`} aria-label="물품 이름" value={item.name} onChange={event => update(item.id, { name: event.target.value })} placeholder="물품 이름" maxLength={100} />
                <button className="sale-item-remove" type="button" disabled={items.length === 1} aria-label={`물품 ${index + 1} 삭제`} onClick={() => {
                    onChange(items.filter(row => row.id !== item.id));
                    focusName(items[index - 1]?.id ?? items[index + 1].id);
                }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
            </div>
            <div className="sale-item-bottom">
                <div className="sale-item-price"><input id={`sale-price-${item.id}`} aria-label="개당 가격" inputMode="numeric" value={giveaway ? '0' : item.price ? Number(item.price).toLocaleString('ko-KR') : ''} disabled={giveaway} onChange={event => update(item.id, { price: event.target.value.replace(/\D/g, '').slice(0, 12) })} placeholder="가격" /><span aria-hidden="true">원/개</span></div>
                <div className="sale-quantity-control">
                    <label className="sale-quantity-enable"><input type="checkbox" checked={item.quantity !== null} onChange={event => update(item.id, { quantity: event.target.checked ? 1 : null })} />수량</label>
                    {item.quantity !== null && <div className="sale-item-quantity"><input id={`sale-quantity-${item.id}`} aria-label="판매 수량" type="number" min={1} step={1} inputMode="numeric" value={item.quantity} onChange={event => update(item.id, { quantity: validQuantity(event.target.valueAsNumber) })} /><span aria-hidden="true">개</span></div>}
                </div>
            </div>
        </section>)}
        <ActionButton type="button" variant="neutralSolid" size="large" className="sale-item-add" onClick={addItem}>+ 물품 추가</ActionButton>
    </div>;
}
