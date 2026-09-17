import { ActionButton } from "@seed-design/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { useDialogControls } from "./useDialogControls";
import "./WritingFlow.css";
import { createPost, savePost, validatePost, type PublishedPost } from "../../data/publishedPosts";
import { type PrototypeUser } from "../../data/userData";
import { PlannedSaleItems } from "./PlannedSaleItems";
import { restoreSaleItems, type SaleItem } from "./saleItems";
import { FeedIcon } from "../home/FeedIcon";
import { publicAsset } from "../../data/publicAsset";

const categories = ["디지털기기", "취미/게임/음반", "삽니다"] as const;
type Category = typeof categories[number];

type Photo = { id: string; src: string; name: string };
type Draft = { items?: SaleItem[]; category: Category | null; directBuy: boolean; photos: Photo[]; title: string; description: string; price: string; giveaway: boolean; giveawayRequests: boolean; offers: boolean; secondary: boolean };
const emptyDraft: Draft = { category: null, directBuy: false, photos: [], title: '', description: '', price: '', giveaway: false, giveawayRequests: false, offers: false, secondary: false };
const referenceBase = publicAsset('reference/');
// An explicit demo album, never a scan of the user's device photo library.
const demoAlbum: Photo[] = [
    { id: 'mac', src: publicAsset('reference/mac.jpg'), name: '맥북 사진' },
    { id: 'write-menu', src: publicAsset('reference/write-flow/01.jpg'), name: '글쓰기 메뉴 캡처' },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `macbook-${10 - i}`, src: publicAsset(`reference/macbook-bundle/${String(10 - i).padStart(2, '0')}.${10 - i >= 9 ? 'png' : 'jpg'}`), name: `맥북 게시글 캡처 ${10 - i}` })),
    { id: 'home', src: publicAsset('reference/home-feed.png'), name: '홈 피드 캡처' },
];
function readDraft(draftKey: string, planned: boolean): Draft {
    const initial = { ...emptyDraft, ...(planned ? { items: restoreSaleItems(undefined) } : {}) };
    try {
        const value = JSON.parse(localStorage.getItem(draftKey) ?? 'null') as Partial<Draft> | null;
        if (!value) return initial;
        return {
            ...initial,
            ...(planned ? { items: restoreSaleItems(value.items, value.price) } : {}),
            category: categories.includes(value.category as Category) ? value.category as Category : null,
            directBuy: value.giveaway !== true && value.directBuy === true && typeof value.title === 'string' && !!value.title.trim() && categories.includes(value.category as Category),
            title: typeof value.title === 'string' ? value.title : '',
            description: typeof value.description === 'string' ? value.description : '',
            price: typeof value.price === 'string' ? value.price.replace(/\D/g, '').slice(0, 12) : '',
            giveaway: value.giveaway === true, giveawayRequests: value.giveawayRequests === true, offers: value.offers === true, secondary: value.secondary === true,
            photos: Array.isArray(value.photos) ? value.photos.filter((p): p is Photo => !!p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.src === 'string' && (p.src.startsWith(referenceBase) || p.src.startsWith('data:image/'))).slice(0, 10) : [],
        };
    } catch { return initial; }
}
function CameraIcon() {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M11 5h10l2 4h4a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3h4Z"/><circle cx="16" cy="19" r="7" fill="#16171b"/><circle cx="16" cy="19" r="4" fill="currentColor"/><circle cx="25" cy="13" r="1.5" fill="#16171b"/></svg>;
}
function CloseIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M21 3 3 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange?: () => void; disabled?: boolean }) {
    return <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={onChange} className="write-switch"><span /></button>;
}

export function WritingFlow({ user, onPublished, planned = false, draftKey, neighborhood, secondaryNeighborhood, onClose }: { user: PrototypeUser; onPublished: (post: PublishedPost) => void; planned?: boolean; draftKey: string; neighborhood: string; secondaryNeighborhood?: string; onClose: () => void }) {
    const [draft, setDraft] = useState<Draft>(() => readDraft(draftKey, planned));
    const [picker, setPicker] = useState<'waiting' | 'open' | 'closing' | 'closed'>('waiting');
    const [closing, setClosing] = useState(false);
    const [selected, setSelected] = useState<Photo[]>(draft.photos);
    const [imports, setImports] = useState<Photo[]>(draft.photos.filter(p => p.src.startsWith('data:')));
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const publishingRef = useRef(false);
    const formRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const mounted = useRef(true);
    const openingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const closeForm = useCallback(() => { if (!publishingRef.current) setClosing(true); }, []);
    const closePicker = useCallback(() => { setPicker('closing'); setNotice(''); }, []);
    useDialogControls(formRef, picker === 'closed' && !closing, closeForm);
    useDialogControls(pickerRef, picker === 'open', closePicker);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(openingTimer.current); }; }, []);
    useLayoutEffect(() => {
        const input = descriptionRef.current;
        if (!input) return;
        input.style.height = 'auto';
        const style = getComputedStyle(input);
        input.style.height = `${input.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)}px`;
    }, [planned, draft.description, draft.category, neighborhood]);
    // Let the writing sheet arrive first. A short pause makes the stacked transition visible.
    const onFormEntered = () => {
        if (picker === 'waiting') openingTimer.current = setTimeout(() => setPicker('open'), 100);
    };
    const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));
    const changeTitle = (title: string) => setDraft(current => ({ ...current, title, ...(!title.trim() ? { category: null, directBuy: false } : {}) }));
    const showDirectBuy = !!draft.title.trim() && draft.category !== null;
    const openPicker = () => { setSelected(draft.photos); setNotice(''); setPicker('open'); };
    const togglePhoto = (photo: Photo) => {
        if (selected.some(item => item.id === photo.id)) setSelected(current => current.filter(item => item.id !== photo.id));
        else if (selected.length < 10) setSelected(current => [...current, photo]);
        else setNotice('사진은 최대 10장까지 선택할 수 있어요.');
    };
    const upload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = [...(event.target.files ?? [])];
        event.target.value = '';
        if (!files.length) return;
        setLoading(true);
        setNotice('');
        const room = 10 - selected.length;
        const accepted = files.filter(file => file.type.startsWith('image/'));
        try {
            const photos = await Promise.all(accepted.slice(0, room).map(async file => {
                const src = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
                });
                const preview = new Image(); preview.src = src; await preview.decode();
                return { id: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`, src, name: file.name };
            }));
            if (!mounted.current) return;
            setImports(current => [...photos, ...current]);
            setSelected(current => [...current, ...photos].slice(0, 10));
            if (accepted.length > room) setNotice('사진은 최대 10장까지 선택할 수 있어요.');
            else if (accepted.length !== files.length) setNotice('이미지 파일만 선택할 수 있어요.');
        } catch { if (mounted.current) setNotice('이 사진은 열 수 없어요. JPG 또는 PNG 파일로 다시 선택해주세요.'); }
        finally { if (mounted.current) setLoading(false); }
    };
    const saveDraft = () => {
        try { localStorage.setItem(draftKey, JSON.stringify(draft)); setNotice('임시저장했어요.'); }
        catch { setNotice('저장 공간이 부족해 임시저장하지 못했어요. 사진을 줄여주세요.'); }
    };
    const publish = async () => {
        if (publishingRef.current) return;
        setNotice('');
        const postInput = planned ? draft : { ...draft, items: [{ id: 'current', name: draft.title, price: draft.giveaway ? '0' : draft.price, quantity: null }] };
        const error = validatePost(postInput);
        if (error) {
            setSubmitError(error.message);
            formRef.current?.querySelector<HTMLElement>(error.target)?.focus();
            return;
        }
        publishingRef.current = true;
        setPublishing(true);
        setSubmitError('');
        const post = createPost(postInput, { provinceId: user.verifiedNeighborhoods[0].provinceId, id: user.id, nickname: user.nickname, neighborhood, secondaryNeighborhood: secondaryNeighborhood ?? '', tradePlace: user.tradePlace, pickupAddress: user.pickupAddress }, planned ? 'planned' : 'current');
        try {
            await savePost(post);
        } catch {
            publishingRef.current = false;
            if (mounted.current) { setPublishing(false); setSubmitError('게시글을 저장하지 못했어요. 입력 내용은 유지됩니다. 저장 공간을 확인하고 다시 시도해주세요.'); }
            return;
        }
        try { localStorage.setItem(draftKey, 'null'); } catch { /* The published post is already safely committed. */ }
        onPublished(post);
        setClosing(true);
    };
    const album = [...imports, ...demoAlbum];
    const pickerVisible = picker === 'open' || picker === 'closing';
    return <div className="writing-flow">
        <div className="write-sheet" data-closing={closing} ref={formRef} role="dialog" aria-modal={picker === 'closed' ? true : undefined} aria-label="중고 물품 글쓰기" inert={picker !== 'closed' || closing}
            onAnimationEnd={event => { if (event.target !== event.currentTarget) return; if (closing) onClose(); else onFormEntered(); }}>
            <header className="write-header">
                <button className="write-icon-button" aria-label="글쓰기 닫기" disabled={publishing} onClick={closeForm}><CloseIcon /></button>
                <h1>{neighborhood}에 올리기</h1>
                <button className="write-save" disabled={publishing} onClick={saveDraft}>임시저장</button>
            </header>
            <form className="write-form" inert={publishing} onSubmit={event => event.preventDefault()}>
                <div className="write-photos" aria-label="게시글 사진">
                    <button type="button" className="write-add-photo" onClick={openPicker} aria-label={`사진 추가, ${draft.photos.length}/10장`}><CameraIcon /><span><b>{draft.photos.length}</b>/10</span></button>
                    {draft.photos.map((photo, index) => <div className="write-photo" key={photo.id}><img src={photo.src} alt={`선택한 사진 ${index + 1}`} />{index === 0 && <span className="write-cover">대표 사진</span>}<button type="button" onClick={() => update('photos', draft.photos.filter(item => item.id !== photo.id))} aria-label={`사진 ${index + 1} 삭제`}><CloseIcon /></button></div>)}
                </div>
                <label className="write-field write-title" data-has-title={!!draft.title.trim()}>제목<input id="write-title" value={draft.title} onChange={event => changeTitle(event.target.value)} placeholder="제목을 입력해주세요." maxLength={100} /></label>
                {!!draft.title.trim() && <div className="write-categories" role="group" aria-label="카테고리">
                    {categories.map(category => <button type="button" key={category} aria-pressed={draft.category === category} onClick={() => update('category', category)}>{category}</button>)}
                    <span className="write-category-more"><span aria-hidden="true">›</span><select aria-label="카테고리 선택" value={draft.category ?? ''} onChange={event => update('category', event.target.value as Category)}><option value="" disabled>카테고리 선택</option>{categories.map(category => <option key={category}>{category}</option>)}</select></span>
                </div>}
                <label className="write-field write-description" data-category={draft.category}>자세한 설명<textarea id="write-description" ref={descriptionRef} data-auto-grow="true" value={draft.description} onChange={event => update('description', event.target.value)} placeholder={draft.category === '디지털기기' ? "모델명, 구성품, 구매처, 구매 시기, 사용감(흠집, 파손 여부), 수리 여부 등 물품 설명을 최대한 자세히 적어주세요.\n\n· 안전한 거래를 위해 'KC인증마크' 등 제품안전정보가 보이는 사진을 포함해주세요.\n· 신뢰할 수 있는 거래를 위해 과학기술정보통신부, 한국인터넷진흥원과 함께 해요." : `${neighborhood}에 올릴 게시글 내용을 작성해 주세요. (판매 금지 물품은 게시가 제한될 수 있어요.)\n\n신뢰할 수 있는 거래를 위해 자세히 적어주세요. 과학기술정보통신부, 한국 인터넷진흥원과 함께 해요.`} /></label>
                <button type="button" className="write-phrases" disabled>자주 쓰는 문구</button>
                <fieldset className="write-price"><legend>{planned ? "판매 물품" : "가격"}</legend>
                    <div className="write-price-chips"><button type="button" aria-pressed={!draft.giveaway} onClick={() => update('giveaway', false)}>판매하기</button><button type="button" aria-pressed={draft.giveaway} onClick={() => setDraft(current => ({ ...current, giveaway: true, directBuy: false }))}>나눔하기</button></div>
                    {planned ? <PlannedSaleItems items={draft.items!} giveaway={draft.giveaway} onChange={items => update('items', items)} /> : <input id="sale-price-current" aria-label="가격" inputMode="numeric" disabled={draft.giveaway} value={draft.giveaway ? '₩ 0' : draft.price ? Number(draft.price).toLocaleString('ko-KR') : ''} onChange={event => update('price', event.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="₩ 가격을 입력해주세요." />}
                    {draft.giveaway ? <div className="write-offers"><label><input type="checkbox" checked={draft.giveawayRequests} onChange={event => update('giveawayRequests', event.target.checked)} />나눔 신청 받기</label><button type="button" disabled>알아보기</button></div> : <label className="write-offers"><input type="checkbox" checked={draft.offers} onChange={event => update('offers', event.target.checked)} />가격 제안 받기</label>}
                </fieldset>
                <fieldset className="write-trade"><legend>거래 설정</legend>
                    <div className="write-trade-row"><strong>거래 희망 장소</strong><span>{user.tradePlace}</span></div>
                    {secondaryNeighborhood && <div className="write-trade-row"><strong>{secondaryNeighborhood}에도 올리기</strong><Toggle label={`${secondaryNeighborhood}에도 올리기`} checked={draft.secondary} onChange={() => update('secondary', !draft.secondary)} /></div>}
                </fieldset>
                {showDirectBuy && <section className="write-direct-buy" aria-label="바로구매 설정">
                    <div className="write-direct-heading"><h2>바로구매 설정</h2><button type="button" disabled>바로구매란?</button></div>
                    <div className="write-direct-card">
                        <div className="write-direct-toggle"><strong>전국으로 판매하기</strong><span className="write-direct-badge"><FeedIcon name="shopping" />바로구매</span><Toggle label="전국으로 판매하기" disabled={draft.giveaway} checked={!draft.giveaway && draft.directBuy} onChange={() => update('directBuy', !draft.directBuy)} /></div>
                        <ul><li>구매자가 배송비를(2,400원~) 포함하여 결제해요.</li><li>판매되면 기사님이 집 앞에서 수거해요.</li></ul>
                        {draft.giveaway && <div className="write-giveaway-warning"><span aria-hidden="true">!</span>나눔 거래에는 사용할 수 없어요</div>}
                        {!draft.giveaway && draft.directBuy && <div className="write-shipping-details">
                            <button type="button" disabled><strong>택배 크기/무게</strong><span>입력하기</span><i aria-hidden="true">›</i></button>
                            <button type="button" disabled><strong>수거지</strong><span>{user.pickupAddress}</span><i aria-hidden="true">›</i></button>
                        </div>}
                    </div>
                </section>}
                {showDirectBuy && !draft.giveaway && draft.directBuy && <div className="write-direct-consent"><button type="button" disabled>(필수) 파손 면책 동의</button><button type="button" disabled>바로구매 택배예약 서비스 제공자 안내</button><p>위 내용을 확인하였으며 정보 제공 등에 동의합니다.</p></div>}
            </form>
            <footer className="write-form-footer">{submitError && <p className="write-submit-error" role="alert">{submitError}</p>}<ActionButton className="write-complete" variant="brandSolid" size="large" disabled={publishing} onClick={publish}>{publishing ? '등록 중…' : '작성 완료'}</ActionButton></footer>
        </div>
        {pickerVisible && <div ref={pickerRef} className="write-sheet photo-picker" data-closing={picker === 'closing'} role="dialog" aria-modal="true" aria-label="사진 선택" inert={picker === 'closing'}
            onAnimationEnd={event => { if (event.target === event.currentTarget && picker === 'closing') setPicker('closed'); }}>
            <header className="write-header"><button className="write-icon-button" aria-label="사진 선택 닫기" onClick={closePicker}><CloseIcon /></button><h1>최근 항목 <span className="album-chevron" aria-hidden="true" /></h1></header>
            <div className="photo-picker-grid" aria-label="최근 사진 목록" aria-busy={loading}>
                <button className="photo-camera" onClick={() => fileRef.current?.click()} disabled={loading || selected.length >= 10}><CameraIcon /><span>{loading ? '불러오는 중' : '카메라'}</span></button>
                {album.map(photo => { const index = selected.findIndex(item => item.id === photo.id); return <button key={photo.id} className="photo-choice" aria-label={photo.name} aria-pressed={index >= 0} disabled={loading} onClick={() => togglePhoto(photo)}><img src={photo.src} alt="" loading="lazy" /><span className="photo-selection-number" aria-hidden="true">{index >= 0 ? index + 1 : ''}</span></button>; })}
            </div>
            <footer className="photo-picker-footer">
                <div className="photo-option"><div><strong>여러 물건 글쓰기 <span className="photo-limit-badge">사진 최대 30장</span></strong><p>AI가 사진을 분류하여 물건별로 게시글을 작성해요</p></div><Toggle label="여러 물건 글쓰기" checked={false} disabled /></div>
                <div className="photo-option"><strong>AI로 작성해요</strong><Toggle label="AI로 작성해요" checked={false} disabled /></div>
                {selected.length > 0 && <div className="photo-picker-actions"><ActionButton variant="neutralSolid" size="large" disabled>편집</ActionButton><ActionButton className="photo-confirm" variant="neutralSolid" size="large" disabled={loading} onClick={() => { update('photos', selected); closePicker(); }}>{selected.length}장 올리기</ActionButton></div>}
            </footer>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
        </div>}
        {notice && <div className="write-notice" role="status" onClick={() => setNotice('')}>{notice}</div>}
    </div>;
}
