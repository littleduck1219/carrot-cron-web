import { useState } from "react";
import type { PublishedPost } from "../../data/publishedPosts";
import { getSoldItems, ordersForPost, type DealOrder } from "../checkout/purchases";
import { ChatRoom } from "../chat/ChatRoom";
import { FeedIcon } from "../home/FeedIcon";
import "./account.css";

const won = (value: number) => value.toLocaleString('ko-KR') + '원';
const when = (ms: number) => new Date(ms).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Seller's 거래내역 for one listing: every order (paid or cancelled) with amounts, plus what is still unsold. Prototype design 2026-09-24 (no captured reference). */
export function DealHistoryScreen({ postKey, title, imageSrc, post, viewerName, onBack, onOpenPost }: { postKey: string; title: string; imageSrc?: string; post?: PublishedPost; viewerName: string; onBack: () => void; onOpenPost: () => void }) {
    const [orders] = useState<DealOrder[]>(() => ordersForPost(postKey));
    const [open, setOpen] = useState<string | null>(null);
    const [chat, setChat] = useState<DealOrder | null>(null);
    const paid = orders.filter(order => order.status === 'paid');
    const itemCount = paid.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0), 0);
    const goods = paid.reduce((sum, order) => sum + order.goods, 0);
    const sold = getSoldItems(postKey);
    const remaining = post ? post.items.filter(item => !(item.soldOut || (!post.giveaway && item.price === 0)) && item.quantity - (sold[item.id] ?? 0) > 0).length : 0;
    return <>
    <div className="sales-screen history-screen" inert={chat !== null}>
        <header className="sales-header"><button type="button" aria-label="뒤로" onClick={onBack}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m15 3-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button><h1>거래내역</h1><button type="button" onClick={onOpenPost}>게시글 보기</button></header>
        <main className="sales-scroll">
            <section className="history-summary">
                {imageSrc ? <img src={imageSrc} alt="" /> : <span><FeedIcon name="shopping" /></span>}
                <div><h2>{title}</h2><p>거래 {paid.length}건 · 물품 {itemCount}개 · {won(goods)}</p>{post && post.format === 'planned' && <small>{remaining > 0 ? `남은 물품 ${remaining}개` : '모든 물품 판매완료'}</small>}</div>
            </section>
            {orders.length === 0 && <div className="sales-empty">아직 거래가 없어요.</div>}
            {orders.map(order => <article className="order-card" key={order.id} data-cancelled={order.status === 'cancelled'}>
                <div className="order-head"><strong>{order.buyerName}</strong><span>{order.buyerNeighborhood}</span><em>{order.status === 'cancelled' ? '거래취소' : '거래완료'}</em></div>
                <p className="order-when">{when(order.createdAt)} 결제</p>
                <ul className="order-items">{order.items.map(item => <li key={item.id}><span>{item.name}</span><b>{item.quantity}개 · {won(item.price * item.quantity)}</b></li>)}</ul>
                <button type="button" className="order-total" aria-expanded={open === order.id} onClick={() => setOpen(value => value === order.id ? null : order.id)}><span>결제 금액</span><strong>{won(order.total)}</strong><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-open={open === order.id}><path d="m6 9 6 6 6-6" /></svg></button>
                {open === order.id && <dl className="order-breakdown"><div><dt>물품 금액</dt><dd>{won(order.goods)}</dd></div><div><dt>구매자 보호 수수료</dt><dd>{won(order.fee)}</dd></div><div><dt>배송비</dt><dd>{won(order.shipping)}</dd></div><div className="order-settle"><dt>정산 예정액</dt><dd>{won(order.goods)}</dd></div></dl>}
                <div className="order-actions"><button type="button" onClick={() => setChat(order)}>채팅하기</button><button type="button" disabled>받은 후기 보기</button></div>
            </article>)}
        </main>
    </div>
    {chat && <ChatRoom partner={{ nickname: chat.buyerName, neighborhood: chat.buyerNeighborhood }} product={{ title: chat.title, price: won(chat.goods), thumbnail: chat.imageSrc ? <img src={chat.imageSrc} alt="" /> : undefined }} viewerName={viewerName} completed onClose={() => setChat(null)} />}
    </>;
}
