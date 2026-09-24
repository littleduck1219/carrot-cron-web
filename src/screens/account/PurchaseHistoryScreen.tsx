import { useState } from "react";
import { ordersForBuyer, type DealOrder } from "../checkout/purchases";
import { ReviewFlow } from "../review/ReviewFlow";
import { FeedIcon } from "../home/FeedIcon";
import "./account.css";

const won = (value: number) => value.toLocaleString('ko-KR') + '원';
const day = (ms: number) => { const d = new Date(ms); return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
const filters = ['전체', '중고거래', '스토어', '포장주문', '선물가게'];

/** Buyer's 구매내역, after the captured list (2026-09-17): state · 바로구매 · date, summary, and 후기 보내기 for completed deals. */
export function PurchaseHistoryScreen({ viewerId, viewerName, onBack, onOpenPost }: { viewerId: string; viewerName: string; onBack: () => void; onOpenPost: (order: DealOrder) => void }) {
    const [orders] = useState<DealOrder[]>(() => ordersForBuyer(viewerId));
    const [review, setReview] = useState<DealOrder | null>(null);
    return <>
    <div className="sales-screen history-screen" inert={review !== null}>
        <header className="sales-header"><button type="button" aria-label="뒤로" onClick={onBack}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m15 3-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button><h1>구매내역</h1><span /></header>
        <div className="sales-tabs purchase-filters" role="tablist" aria-label="구매 종류">{filters.map((label, index) => <button key={label} role="tab" aria-selected={index === 0} disabled={index !== 0}>{label}</button>)}</div>
        <main className="sales-scroll">
            {orders.length === 0 && <div className="sales-empty">구매한 물품이 없어요.</div>}
            {orders.map(order => <article className="sales-card purchase-card" key={order.id}>
                <div className="sales-card-state">{order.status === 'cancelled' ? '거래취소' : '거래완료'} {order.kind === 'direct' ? <em className="purchase-direct">직거래</em> : <em><FeedIcon name="shopping" />바로구매</em>}<small>{day(order.createdAt)} 거래</small></div>
                <button type="button" className="sales-summary purchase-summary" onClick={() => onOpenPost(order)}>{order.imageSrc ? <img src={order.imageSrc} alt="" /> : <span><FeedIcon name="shopping" /></span>}<div><h2>{order.title}</h2><p>{order.sellerNeighborhood}{order.items.length > 1 ? ` · 물품 ${order.items.length}종` : ''}</p><strong>{won(order.goods)}</strong></div></button>
                {order.status === 'paid' && <button type="button" className="sales-review purchase-review" onClick={() => setReview(order)}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2-2.35-2.35a1 1 0 0 0-1.4 0l-1.85 1.85 3.75 3.75 1.85-1.85a1 1 0 0 0 0-1.4Z" /></svg>후기 보내기</button>}
            </article>)}
        </main>
    </div>
    {review && <ReviewFlow viewerName={viewerName} partnerName={review.sellerName} product={{ title: review.title, thumbnail: review.imageSrc ? <img src={review.imageSrc} alt="" /> : undefined }} onClose={() => setReview(null)} />}
    </>;
}
