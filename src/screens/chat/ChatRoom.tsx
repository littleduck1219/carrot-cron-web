import { useRef, useState, type ReactNode } from 'react';
import { useDialogControls } from '../write/useDialogControls';
import { ReviewFlow } from '../review/ReviewFlow';
import './ChatRoom.css';

export type ChatPartner = { nickname: string; temperature?: string; neighborhood?: string };
export type ChatProduct = { title: string; price: string; thumbnail?: ReactNode; offers?: boolean };

function Icon({ name }: { name: 'chevron' | 'phone' | 'more' | 'calendar' | 'won' | 'pen' | 'spark' | 'smile' | 'send' | 'person' }) {
    return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {name === 'chevron' && <path d="m6 9 6 6 6-6" strokeWidth="2.2" />}
        {name === 'phone' && <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />}
        {name === 'more' && <><circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" /></>}
        {name === 'calendar' && <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>}
        {name === 'won' && <><circle cx="12" cy="12" r="9" /><path d="M6.5 9l2 7 2-7 1.5 7 2-7 2 7 2-7M6 12h12" strokeWidth="1.5" /></>}
        {name === 'pen' && <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2-2.35-2.35a1 1 0 0 0-1.4 0l-1.85 1.85 3.75 3.75 1.85-1.85a1 1 0 0 0 0-1.4Z" fill="currentColor" stroke="none" />}
        {name === 'spark' && <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" fill="currentColor" stroke="none" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" fill="currentColor" stroke="none" /></>}
        {name === 'smile' && <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5q3.5 3 7 0" /><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" /></>}
        {name === 'send' && <path d="M3 11.5 21 3l-4 18-5.5-6.5L3 11.5Z" fill="currentColor" stroke="none" />}
        {name === 'person' && <><circle cx="12" cy="9" r="4" fill="currentColor" stroke="none" /><path d="M4 21a8 8 0 0 1 16 0Z" fill="currentColor" stroke="none" /></>}
    </svg>;
}

// Sample exchange shaped after the captured chat (2026-09-17), written from the buyer's side; nothing is sent.
const MESSAGES = (place: string) => [
    { mine: true, text: '안녕하세요. 혹시 직거래 장소는 어디인가요?', time: '오전 9:51' },
    { mine: false, text: `${place} 근처에서 가능합니다`, time: '오전 10:04' },
    { mine: true, text: '구매가 언제셨을까요', time: '오전 10:14' },
    { mine: false, text: '작년쯤이었고 사용은 거의 안 했습니다', time: '오전 10:18' },
    { mine: true, text: '감사합니다. 그러면 구매하려고 합니다', time: '오후 4:17', read: true },
];

/** Static chat room styled after the captured room. The partner name is a hidden control that marks the deal complete, which enables 후기 보내기. */
export function ChatRoom({ partner, product, viewerName, completed = false, onComplete, onClose }: { partner: ChatPartner; product: ChatProduct; viewerName: string; completed?: boolean; onComplete?: () => void; onClose: () => void }) {
    const ref = useRef<HTMLElement>(null);
    const [review, setReview] = useState(false);
    useDialogControls(ref, !review, onClose);
    return <>
    <section ref={ref} className="chat-room" role="dialog" aria-modal="true" aria-label={`${partner.nickname}님과의 채팅`} tabIndex={-1} inert={review}>
        <header className="chat-header">
            <button type="button" aria-label="뒤로 가기" onClick={onClose}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m15 3-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button>
            <button type="button" className="chat-partner" aria-label={completed ? `${partner.nickname}, 거래 완료됨` : `${partner.nickname}, 누르면 거래 완료 처리`} onClick={completed ? undefined : onComplete}>
                <span className="chat-partner-name"><strong>{partner.nickname}</strong>{partner.temperature && <em>{partner.temperature}</em>}</span>
                <small>{[partner.neighborhood, '보통 10분 이내 응답'].filter(Boolean).join(', ')}</small>
            </button>
            <div className="chat-header-actions"><button type="button" aria-label="통화" disabled><Icon name="phone" /></button><button type="button" aria-label="채팅방 메뉴" disabled><Icon name="more" /></button></div>
        </header>
        <div className="chat-product">
            {product.thumbnail && <div className="chat-thumbnail">{product.thumbnail}</div>}
            <div>
                <p className="chat-product-title"><b className="chat-status">{completed ? '거래완료' : '판매중'}<Icon name="chevron" /></b>{product.title}</p>
                <p className="chat-product-price"><strong>{product.price}</strong>{product.offers === false && <span>(가격 제안 불가)</span>}</p>
            </div>
        </div>
        <div className="chat-actions">
            <button type="button" disabled><Icon name="calendar" />약속잡기</button>
            <button type="button" disabled><Icon name="won" />송금요청</button>
            <button type="button" className="chat-review-button" disabled={!completed} onClick={() => setReview(true)}><Icon name="pen" />후기 보내기</button>
        </div>
        <main className="chat-messages" aria-label="대화 내용">
            <p className="chat-date">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {MESSAGES(partner.neighborhood ?? '거래 희망 장소').map((message, index) => <div className={`chat-row ${message.mine ? 'chat-mine' : 'chat-theirs'}`} key={index}>
                {!message.mine && <span className="chat-avatar"><Icon name="person" /></span>}
                <span className="chat-meta">{message.read && <b>읽음</b>}<time>{message.time}</time></span>
                <p className="chat-bubble">{message.text}</p>
            </div>)}
            <button type="button" className="chat-ai" aria-label="AI 답장 추천" disabled><Icon name="spark" /></button>
        </main>
        <footer className="chat-composer">
            <button type="button" aria-label="첨부" disabled>＋</button>
            <div className="chat-input"><input type="text" placeholder="메시지 보내기" aria-label="메시지" disabled /><Icon name="smile" /></div>
            <button type="button" className="chat-send" aria-label="보내기" disabled><Icon name="send" /></button>
        </footer>
    </section>
    {review && <ReviewFlow viewerName={viewerName} partnerName={partner.nickname} product={{ title: product.title, thumbnail: product.thumbnail }} onClose={() => setReview(false)} />}
    </>;
}
