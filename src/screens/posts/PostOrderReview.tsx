import { ActionButton } from '@seed-design/react';
import { useRef } from 'react';
import { type PublishedPost } from '../../data/publishedPosts';
import { useDialogControls } from '../write/useDialogControls';

export function PostOrderReview({ post, quantities, total, onBack }: { post: PublishedPost; quantities: Record<string, number>; total: number; onBack: () => void }) {
    const ref = useRef<HTMLElement>(null);
    useDialogControls(ref, true, onBack);
    const items = post.items.filter(item => quantities[item.id] > 0);
    return <section ref={ref} className="product-detail published-order" role="dialog" aria-modal="true" aria-label="주문 확인" tabIndex={-1}>
        <header className="detail-bar"><button type="button" onClick={onBack} aria-label="물품 선택으로 돌아가기">‹</button><h1>주문 확인</h1></header>
        <main className="detail-scroll">
            <h2>구매할 물품 {items.length}종</h2><p className="order-subtitle">{post.title} · {post.author.nickname}</p>
            <button type="button" className="order-change" onClick={onBack}>선택 변경</button>
            {items.map(item => <div className="published-item" key={item.id}><div><strong>{item.name}</strong><p>{item.price.toLocaleString('ko-KR')}원 × {quantities[item.id]}개</p></div><b>{(item.price * quantities[item.id]).toLocaleString('ko-KR')}원</b></div>)}
            <section className="order-amount"><h2>결제 금액</h2><p>물품 금액 <strong>{total.toLocaleString('ko-KR')}원</strong></p><p>배송비 <span>확인 필요</span></p><p>구매자 보호 수수료 <span>확인 필요</span></p><p className="order-final">최종 결제 금액 <span>추가 비용 확인 후 확정</span></p></section>
            <p className="order-subtitle">현재는 구매 물품을 확인하는 단계예요. 배송비와 수수료가 확정되면 결제를 진행할 수 있어요.</p>
        </main>
        <footer className="detail-footer"><ActionButton className="detail-primary" variant="brandSolid" size="large" disabled>물품 받고 돈 전달하기</ActionButton></footer>
    </section>;
}
