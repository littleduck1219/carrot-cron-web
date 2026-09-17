import { ActionButton } from '@seed-design/react';
import { useRef, useState, type ReactNode } from 'react';
import { useDialogControls } from '../write/useDialogControls';
import './ReviewFlow.css';

type Mood = 'bad' | 'good' | 'best';
const MOODS: { id: Mood; label: string }[] = [{ id: 'bad', label: '별로예요' }, { id: 'good', label: '좋아요!' }, { id: 'best', label: '최고예요!' }];
// Captured for 좋아요 (2026-09-17). The 별로예요 list was not captured, so that mood skips the checklist.
const PRAISES = ['안심 결제를 잘 받아줘요.', '좋은 물품을 저렴하게 판매해요.', '물품 설명이 자세해요.', '거래약속을 잘 지켜요.', '친절하고 매너가 좋아요.', '응답이 빨라요.'];

/** Approximation of the captured bunny faces; replace with the original assets when available. */
function Bunny({ mood, selected }: { mood: Mood; selected: boolean }) {
    return <svg className="review-bunny" viewBox="0 0 96 96" aria-hidden="true" data-selected={selected}>
        <rect width="96" height="96" rx="24" className="review-bunny-bg" />
        <ellipse cx="34" cy="26" rx="10" ry="18" fill="#fff" /><ellipse cx="62" cy="26" rx="10" ry="18" fill="#fff" />
        <circle cx="48" cy="58" r="26" fill="#fff" />
        <ellipse cx="34" cy="40" rx="12" ry="10" className="review-bunny-hair" /><ellipse cx="48" cy="36" rx="13" ry="11" className="review-bunny-hair" /><ellipse cx="62" cy="40" rx="12" ry="10" className="review-bunny-hair" />
        {mood === 'bad' && <><path d="M38 58l6 3M58 58l-6 3" stroke="#3b3d42" strokeWidth="3" strokeLinecap="round" /><path d="M42 72q6-4 12 0" fill="none" stroke="#3b3d42" strokeWidth="3" strokeLinecap="round" /></>}
        {mood === 'good' && <><circle cx="40" cy="60" r="2.5" fill="#3b3d42" /><circle cx="56" cy="60" r="2.5" fill="#3b3d42" /><path d="M42 69q6 5 12 0" fill="none" stroke="#3b3d42" strokeWidth="3" strokeLinecap="round" /></>}
        {mood === 'best' && <><path d="M36 60l4-4 4 4M52 60l4-4 4 4" fill="none" stroke="#3b3d42" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M40 68h16q0 10-8 10t-8-10z" fill="#3b3d42" /><path d="M44 76q4-4 8 0" fill="#ff7a7a" /></>}
    </svg>;
}

/** Approximation of the captured flower-basket illustration; replace with the original asset when available. */
function Flowers() {
    return <svg className="review-flowers" viewBox="0 0 320 170" aria-hidden="true">
        <path d="M120 165h80l10-30H110z" fill="#f3c33c" />
        <path d="M160 150V90M120 150q20-40 40-60M200 150q-20-40-40-60" stroke="#2e8b57" strokeWidth="8" strokeLinecap="round" fill="none" />
        <ellipse cx="112" cy="128" rx="30" ry="14" fill="#2e9e60" /><ellipse cx="210" cy="128" rx="30" ry="14" fill="#2e9e60" />
        {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={160 + 30 * Math.cos(a * Math.PI / 180)} cy={62 + 30 * Math.sin(a * Math.PI / 180)} rx="20" ry="16" fill="#ff8a3d" transform={`rotate(${a} ${160 + 30 * Math.cos(a * Math.PI / 180)} ${62 + 30 * Math.sin(a * Math.PI / 180)})`} />)}
        <circle cx="160" cy="62" r="13" fill="#fff" />
        {[45, 135, 225, 315].map(a => <ellipse key={a} cx={122 + 16 * Math.cos(a * Math.PI / 180)} cy={104 + 16 * Math.sin(a * Math.PI / 180)} rx="12" ry="10" fill="#57a9ff" />)}
        <circle cx="122" cy="104" r="7" fill="#ffe14d" />
        <path d="M212 98q-14-16-6-34 8 10 18 8 2 12-12 26z" fill="#ffb02e" /><path d="M212 98q14-16 6-34-8 10-18 8-2 12 12 26z" fill="#ff9a1f" />
        <ellipse cx="58" cy="84" rx="16" ry="12" fill="#ffc83d" /><path d="M46 84h24" stroke="#4a3217" strokeWidth="4" /><ellipse cx="52" cy="70" rx="8" ry="5" fill="#fff8" /><ellipse cx="66" cy="70" rx="8" ry="5" fill="#fff8" />
    </svg>;
}

function Back({ onClick, label = '뒤로 가기' }: { onClick: () => void; label?: string }) {
    return <button type="button" aria-label={label} onClick={onClick}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m15 3-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button>;
}

/** Captured review flow (2026-09-17): preference + praises → free text → sent. Pages stack; each slides in over the previous page. */
export function ReviewFlow({ viewerName, partnerName, product, onClose }: { viewerName: string; partnerName: string; product: { title: string; thumbnail?: ReactNode }; onClose: () => void }) {
    const [step, setStep] = useState<'rate' | 'text' | 'done'>('rate');
    const [mood, setMood] = useState<Mood | null>(null);
    const [praises, setPraises] = useState<string[]>([]);
    const [text, setText] = useState('');
    const rateRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLElement>(null);
    const doneRef = useRef<HTMLElement>(null);
    useDialogControls(rateRef, step === 'rate', onClose);
    useDialogControls(textRef, step === 'text', () => setStep('rate'));
    useDialogControls(doneRef, step === 'done', onClose);

    return <>
    <section ref={rateRef} className="review-page" role="dialog" aria-modal="true" aria-label="거래 후기 보내기" tabIndex={-1} inert={step !== 'rate'}>
        <header className="review-header"><Back onClick={onClose} /><h1>거래 후기 보내기</h1><span /></header>
        <main className="review-body">
            <div className="review-product">{product.thumbnail && <div className="review-thumbnail">{product.thumbnail}</div>}<div><strong>{product.title}</strong><p>거래한 이웃 <b>{partnerName}</b></p></div></div>
            <h2 className="review-question">{viewerName}님,<br />{partnerName}님과 거래가 어떠셨나요?</h2>
            <p className="review-hint">거래 선호도는 나만 볼 수 있어요.</p>
            <div className="review-moods" role="radiogroup" aria-label="거래 선호도">
                {MOODS.map(item => <button type="button" key={item.id} role="radio" aria-checked={mood === item.id} className="review-mood" data-selected={mood === item.id} onClick={() => setMood(item.id)}><Bunny mood={item.id} selected={mood === item.id} /><span>{item.label}</span></button>)}
            </div>
            {mood && mood !== 'bad' && <div className="review-praises" role="group" aria-label="어떤 점이 좋았나요?">
                <h2>어떤 점이 좋았나요?</h2>
                {PRAISES.map(praise => <label key={praise}><input type="checkbox" checked={praises.includes(praise)} onChange={event => setPraises(current => event.target.checked ? [...current, praise] : current.filter(item => item !== praise))} /><span>{praise}</span></label>)}
            </div>}
        </main>
        {mood && <footer className="review-footer"><ActionButton variant="brandSolid" size="large" onClick={() => setStep('text')}>다음</ActionButton></footer>}
    </section>
    {step !== 'rate' && <section ref={textRef} className="review-page" role="dialog" aria-modal="true" aria-label="거래 후기 작성" tabIndex={-1} inert={step !== 'text'}>
        <header className="review-header"><Back onClick={() => setStep('rate')} /><span /><span /></header>
        <main className="review-body">
            <h2 className="review-title">따뜻한 거래 경험을 알려주세요!</h2>
            <p className="review-hint">남겨주신 거래 후기는 상대방의 프로필에 공개돼요.</p>
            <div className="review-editor">
                <textarea value={text} onChange={event => setText(event.target.value)} aria-label="거래 후기" placeholder="거래 중 기억에 남았던 따뜻한 순간이나 고마웠던 마음을 짧게 남겨보세요. (선택)" rows={4} />
                <button type="button" aria-label="사진 첨부" disabled><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" /></svg></button>
            </div>
        </main>
        <footer className="review-footer"><ActionButton variant="brandSolid" size="large" onClick={() => setStep('done')}>후기 보내기</ActionButton></footer>
    </section>}
    {step === 'done' && <section ref={doneRef} className="review-page" role="dialog" aria-modal="true" aria-label="후기 보내기 완료" tabIndex={-1}>
        <header className="review-header"><Back onClick={onClose} label="채팅으로 돌아가기" /><span /><button type="button" aria-label="더 보기" disabled><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg></button></header>
        <main className="review-body">
            <h2 className="review-question">{partnerName}님에게<br />따뜻한 후기를 보냈어요.</h2>
            <p className="review-hint">{partnerName}님과 {product.title}를 거래했어요.</p>
            <div className="review-card"><div className="review-card-art"><Flowers /></div><div className="review-card-body">
                {text.trim() && <p>{text.trim()}</p>}
                {praises.length > 0 && <ul>{praises.map(praise => <li key={praise}>{praise}</li>)}</ul>}
            </div></div>
        </main>
    </section>}
    </>;
}
