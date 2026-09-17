import { ActionButton } from '@seed-design/react';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { useDialogControls } from '../write/useDialogControls';
import { PurchaseStatus } from './PurchaseStatus';
import './CurrentDirectBuyFlow.css';

type CheckoutProduct = {
    title: string;
    price: number;
    category: string;
    thumbnail?: ReactNode;
    /** Planned version: the selected items, listed under 물품 금액 in the order breakdown. */
    items?: { name: string; quantity: number; price: number }[];
};

function Chevron({ open = false }: { open?: boolean }) {
    return <svg className="checkout-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-open={open}><path d="m6 9 6 6 6-6" /></svg>;
}

export function CurrentDirectBuyFlow({ product, buyerName, address, onClose, purchasable = false, initialStep = 'address', onPaid, onCancelled }: { product: CheckoutProduct; buyerName: string; address: string; onClose: () => void; purchasable?: boolean; initialStep?: 'address' | 'status'; onPaid?: () => void; onCancelled?: () => void }) {
    // purchasable: the current version completes payment and continues to the captured status pages; the planned version stops at the CTA.
    const [step, setStep] = useState<'address' | 'payment' | 'status'>(initialStep);
    // Captured defaults: the order breakdown starts open, the reward detail starts closed.
    const [breakdownOpen, setBreakdownOpen] = useState(true);
    const [rewardOpen, setRewardOpen] = useState(false);
    // Pages stack: address stays beneath payment, payment stays beneath the status pages, so each new page slides in over the previous page.
    const status = step === 'status';
    const payment = step === 'payment' || status;
    // Finishing from the status pages slides the whole stack down before returning to the detail.
    const [dismissing, setDismissing] = useState(false);
    const dismiss = () => setDismissing(true);
    const addressRef = useRef<HTMLElement>(null);
    const paymentRef = useRef<HTMLElement>(null);
    const backToAddress = useCallback(() => setStep('address'), []);
    useDialogControls(addressRef, step === 'address', onClose);
    useDialogControls(paymentRef, step === 'payment', backToAddress);

    const shipping = 3600;
    const protectionFee = Math.round(product.price * 0.022);
    const finalAmount = product.price + shipping + protectionFee;
    const pointReward = Math.floor(finalAmount * 0.005);
    const moneyBalance = 54;
    const chargeAmount = Math.max(0, finalAmount - moneyBalance);

    return <div className="checkout-stack" data-dismissing={dismissing} inert={dismissing} onAnimationEnd={event => { if (event.target === event.currentTarget && dismissing) onClose(); }}>
    <section ref={addressRef} className="current-checkout checkout-address" role="dialog" aria-modal="true" aria-label="배송지 선택" tabIndex={-1} inert={payment}>
        <header className="checkout-header checkout-address-header"><button type="button" aria-label="상품 상세로 돌아가기" onClick={onClose}>‹</button><span /><button type="button" className="checkout-text-button" disabled>주소 관리</button></header>
        <main className="checkout-body">
            <h1>배송받을 주소를 선택해 주세요</h1>
            <p className="checkout-intro">결제한 돈은 물품을 받은 후 판매자에게 전달돼요.</p>
            <label className="checkout-address-card">
                <input type="radio" name="delivery-address" defaultChecked />
                <span><small>기본주소</small><strong>{address}</strong><em>{buyerName} 010-0000-0000</em></span>
            </label>
            <button type="button" className="checkout-add-address" disabled><b>＋</b> 주소 추가</button>
        </main>
        <footer className="checkout-footer"><ActionButton variant="neutralSolid" size="large" onClick={() => setStep('payment')}>다음</ActionButton></footer>
    </section>
    {payment && <section ref={paymentRef} className="current-checkout checkout-payment" role="dialog" aria-modal="true" aria-label="바로구매 결제" tabIndex={-1} inert={status}>
        <header className="checkout-header checkout-close-header"><button type="button" aria-label="닫기" onClick={onClose}>×</button></header>
        <main className="checkout-body">
            <section className="checkout-card checkout-delivery-card"><h2>배송지</h2><p>{address}</p><small>{buyerName} 010-0000-0000</small></section>
            <section className="checkout-product-card">{product.thumbnail && <div className="checkout-thumbnail">{product.thumbnail}</div>}<div><strong>{product.title}</strong><p>{product.category}</p><b>{finalAmount.toLocaleString('ko-KR')}원</b></div></section>
            <section className="checkout-card checkout-point-card"><div><h2>포인트</h2><small>보유 15원</small></div><output>0원</output><button type="button" disabled>전액</button></section>
            <section className="checkout-card checkout-payment-method"><h2>결제수단</h2><div className="checkout-method-title"><i /> <strong>당근머니 결제 <small>0.5% 적립</small></strong></div><div className="checkout-money-box"><p><span>잔액</span><b>{moneyBalance.toLocaleString('ko-KR')}원</b></p><p><span>충전 금액</span><b>{chargeAmount.toLocaleString('ko-KR')}원</b></p><p><span>충전 계좌</span><b>💳 기업 1012<Chevron /></b></p></div><div className="checkout-card-pay"><i /> 카드 간편결제</div></section>
            <button type="button" className="checkout-receipt" disabled><strong>현금영수증 <small>?</small></strong><span>신청하기 ›</span></button>
            <section className="checkout-card checkout-amount"><h2>결제 금액</h2><button type="button" className="checkout-total checkout-toggle" aria-expanded={breakdownOpen} aria-controls="checkout-breakdown" onClick={() => setBreakdownOpen(open => !open)}><span>총 주문 금액</span><strong>{finalAmount.toLocaleString('ko-KR')}원<Chevron open={breakdownOpen} /></strong></button><div className="checkout-collapse" id="checkout-breakdown" data-open={breakdownOpen} inert={!breakdownOpen}><dl><div><dt>물품 금액</dt><dd>{product.price.toLocaleString('ko-KR')}원</dd></div>{product.items?.map(item => <div className="checkout-item-line" key={item.name}><dt>{item.name} <small>{item.quantity}개</small></dt><dd>{(item.price * item.quantity).toLocaleString('ko-KR')}원</dd></div>)}<div><dt>구매자 보호 수수료 <small>?</small></dt><dd>{protectionFee.toLocaleString('ko-KR')}원</dd></div><div><dt>배송비</dt><dd>{shipping.toLocaleString('ko-KR')}원</dd></div></dl></div><div className="checkout-final"><span>최종 결제 금액</span><strong>{finalAmount.toLocaleString('ko-KR')}원</strong></div></section>
            <section className="checkout-card checkout-reward"><button type="button" className="checkout-toggle" aria-expanded={rewardOpen} aria-controls="checkout-reward-detail" onClick={() => setRewardOpen(open => !open)}><h2>포인트 적립</h2><strong>+{pointReward.toLocaleString('ko-KR')}원<Chevron open={rewardOpen} /></strong></button><div className="checkout-collapse" id="checkout-reward-detail" data-open={rewardOpen} inert={!rewardOpen}><p className="checkout-reward-detail"><span>머니결제 기본혜택(0.5%)</span><span>+{pointReward.toLocaleString('ko-KR')}원</span></p></div></section>
        </main>
        <footer className="checkout-footer checkout-payment-footer"><ActionButton variant="neutralSolid" size="large" disabled={!purchasable} onClick={() => { onPaid?.(); setStep('status'); }}>{finalAmount.toLocaleString('ko-KR')}원 결제하기</ActionButton><p>결제 정보 확인 및 처리를 위한 개인정보 제공 동의</p></footer>
    </section>}
    {status && <PurchaseStatus onClose={dismiss} onCancelled={() => { onCancelled?.(); dismiss(); }} />}
    </div>;
}
