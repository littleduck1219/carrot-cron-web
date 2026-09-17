import { ActionButton } from '@seed-design/react';
import { useRef, useState } from 'react';
import { useDialogControls } from '../write/useDialogControls';

const CANCEL_REASONS = ['직거래 등 다른 방법으로 거래하고 싶어요', '구매자 보호 수수료가 비싸요', '물품의 정보가 충분하지 않아요', '그냥 구매하고 싶지 않아요', '택배비가 비싸요', '직접 입력하기'];
const INFO_ROWS = ['결제 내역', '받는 사람 정보', '자주 묻는 질문', '바로구매 이용방법'];

/**
 * Captured post-payment pages (2026-09-17): status → cancel confirm → cancel reason → cancelled.
 * Pages stack: each earlier page stays mounted (inert) beneath the next one, so a new page slides in over the previous page, not over the detail.
 */
export function PurchaseStatus({ onClose, onCancelled }: { onClose: () => void; onCancelled: () => void }) {
    const [step, setStep] = useState<'status' | 'reason' | 'cancelled'>('status');
    const [confirming, setConfirming] = useState(false);
    const [reasons, setReasons] = useState<string[]>([]);
    const statusRef = useRef<HTMLElement>(null);
    const reasonRef = useRef<HTMLElement>(null);
    const cancelledRef = useRef<HTMLElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    useDialogControls(statusRef, step === 'status' && !confirming, onClose);
    useDialogControls(reasonRef, step === 'reason', () => setStep('status'));
    useDialogControls(cancelledRef, step === 'cancelled', onCancelled);
    useDialogControls(dialogRef, confirming, () => setConfirming(false));

    return <>
    <section ref={statusRef} className="current-checkout purchase-status" role="dialog" aria-modal="true" aria-label="바로구매 진행 상태" tabIndex={-1} inert={confirming || step !== 'status'}>
        <header className="checkout-header checkout-close-header"><button type="button" aria-label="닫기" onClick={onClose}>×</button><span /><button type="button" className="checkout-text-button" onClick={() => setConfirming(true)}>구매 취소</button></header>
        <main className="checkout-body purchase-body">
            <p className="purchase-eyebrow">바로구매 시작</p>
            <h1>판매자가 택배를 예약하고 있어요</h1>
            <p className="purchase-copy">예약이 완료되면 바로 알려드릴게요. 결제한 돈은 당근이 안전하게 보관하고 있어요.</p>
            {/* Approximation of the captured bag illustration; replace with the original asset when available. */}
            <svg className="purchase-illustration" viewBox="0 0 160 160" aria-hidden="true">
                <path d="M46 40c0-16 12-27 27-27s27 11 27 27v8h-10v-8c0-10-7-17-17-17S56 30 56 40v8H46z" fill="#ff7e36" />
                <path d="M28 56h100l-9 74a10 10 0 0 1-10 9H47a10 10 0 0 1-10-9z" fill="#ff6f00" />
                <path d="M44 118c22-10 36-22 50-46" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
                <path d="M76 66h28v28" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="128" cy="40" r="24" fill="#3b8cff" /><circle cx="128" cy="40" r="11" fill="none" stroke="#fff" strokeWidth="5" />
            </svg>
            <ul className="purchase-rows">{INFO_ROWS.map(label => <li key={label}><button type="button" disabled>{label}<span aria-hidden="true">›</span></button></li>)}</ul>
        </main>
        <footer className="checkout-footer"><ActionButton variant="neutralSolid" size="large" onClick={onClose}>닫기</ActionButton></footer>
    </section>
    {step !== 'status' && <section ref={reasonRef} className="current-checkout purchase-status" role="dialog" aria-modal="true" aria-label="바로구매 취소 이유" tabIndex={-1} inert={step !== 'reason'}>
        <header className="checkout-header checkout-close-header"><button type="button" aria-label="취소하지 않고 돌아가기" onClick={() => setStep('status')}>×</button></header>
        <main className="checkout-body purchase-body">
            <h1>바로구매를 취소하는<br />이유를 알려주세요</h1>
            <p className="purchase-copy">여러개를 선택해도 괜찮아요.</p>
            <div className="purchase-reasons" role="group" aria-label="취소 이유">
                {CANCEL_REASONS.map(reason => <label key={reason} className="purchase-reason" data-checked={reasons.includes(reason)}>
                    <span>{reason}</span><input type="checkbox" checked={reasons.includes(reason)} onChange={event => setReasons(current => event.target.checked ? [...current, reason] : current.filter(item => item !== reason))} />
                </label>)}
            </div>
        </main>
        <footer className="checkout-footer"><ActionButton variant="neutralSolid" size="large" disabled={reasons.length === 0} onClick={() => setStep('cancelled')}>확인</ActionButton></footer>
    </section>}
    {step === 'cancelled' && <section ref={cancelledRef} className="current-checkout purchase-status" role="dialog" aria-modal="true" aria-label="바로구매 취소 완료" tabIndex={-1}>
        <header className="checkout-header checkout-close-header"><button type="button" aria-label="닫기" onClick={onCancelled}>×</button></header>
        <main className="checkout-body purchase-body purchase-done">
            <svg className="purchase-check" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#1f3a31" /><path d="m21 33 8 8 15-16" fill="none" stroke="#2fd39b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <h1>바로구매가 취소됐어요</h1>
            <p className="purchase-copy">결제했던 금액은 당근머니로 즉시 환불돼요.</p>
        </main>
        <footer className="checkout-footer"><ActionButton variant="neutralSolid" size="large" onClick={onCancelled}>확인</ActionButton></footer>
    </section>}
    {/* Sibling of the pages so a page can be inert while the dialog stays interactive. */}
    {confirming && <div className="purchase-dialog-backdrop"><div ref={dialogRef} className="purchase-dialog" role="alertdialog" aria-modal="true" aria-labelledby="purchase-cancel-title" tabIndex={-1}>
        <h2 id="purchase-cancel-title">바로구매를 취소할까요?</h2>
        <p>취소하면 물품을 받아볼 수 없어요.<br />결제했던 돈은 환불돼요.</p>
        <div><button type="button" className="purchase-dialog-no" onClick={() => setConfirming(false)}>아니요</button><button type="button" className="purchase-dialog-yes" onClick={() => { setConfirming(false); setStep('reason'); }}>취소할래요</button></div>
    </div></div>}
    </>;
}
