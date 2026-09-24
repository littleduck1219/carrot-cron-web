import { ActionButton, Badge, Chip } from '@seed-design/react';
import { useCallback, useRef, useState } from 'react';
import { postAge, postPriceLabel, type PublishedPost } from '../../data/publishedPosts';
import { FeedIcon } from '../home/FeedIcon';
import { PostMenu } from './PostMenu';
import { CurrentDirectBuyFlow } from '../checkout/CurrentDirectBuyFlow';
import { addOrder, cancelBuyerOrders, cancelOrder, clearCompleted, clearPurchase, getCompletedBuyer, getSoldItems, isPurchased, isSoldOut, markCompleted, markPurchased, recordOrder } from '../checkout/purchases';
import { ChatRoom } from '../chat/ChatRoom';
import { Cards, DetailIcon, SourceImage } from '../detail/ProductDetail';
import { region } from '../detail/productData';
import { macbookBundle } from '../detail/macbookBundleData';
import { bookPostSimilar } from '../detail/bookPostData';
import { gamePostRecommendations } from '../detail/gamePostData';
import '../detail/ProductDetail.css';
import './PublishedPosts.css';

export function PublishedPostDetail({ planned, viewerId, viewerName, viewerAddress, viewerProvinceId, post, error, onBack, onDelete, onOpenHistory }: { planned: boolean; viewerId: string; viewerName: string; viewerAddress: string; viewerProvinceId: string; post?: PublishedPost; error: boolean; onBack: () => void; onDelete: () => void; onOpenHistory?: () => void }) {
    const isOwnPost = !!post && post.author.id === viewerId;
    const [likedBy, setLikedBy] = useState<string[]>([]);
    const liked = likedBy.includes(viewerId);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [checkout, setCheckout] = useState(false);
    const [chat, setChat] = useState(false);
    const [selectionError, setSelectionError] = useState(false);
    // Leaving slides the screen back out to the right; onBack runs once that animation ends.
    const [closing, setClosing] = useState(false);
    const close = () => setClosing(true);
    const questionsRef = useRef<HTMLElement>(null);
    const itemsRef = useRef<HTMLElement>(null);
    const selectedItems = post?.items.filter(item => quantities[item.id] > 0) ?? [];
    const total = selectedItems.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
    const selectedCount = selectedItems.reduce((sum, item) => sum + quantities[item.id], 0);
    // A paid direct purchase opens chat even across regions (user rule, 2026-09-17). Both versions pay (planned attached 2026-09-17).
    const purchaseKey = `post:${post?.id ?? ''}`;
    const [purchased, setPurchased] = useState(() => !!post && isPurchased(purchaseKey, viewerId));
    const canChat = purchased || viewerProvinceId === post?.author.provinceId;
    // Completed deal (set from the chat's hidden control): title gets 거래완료 and only the buyer can still chat.
    const [completedBuyer, setCompletedBuyer] = useState(() => getCompletedBuyer(purchaseKey));
    // Planned posts sell per item: paid items become uncheckable 판매완료; the post is sold once every item is.
    const [soldItems, setSoldItems] = useState(() => getSoldItems(purchaseKey));
    // Sold-out flag, or a zero price on a non-giveaway post, means the item is already sold (user rule 2026-09-24: never show it as 나눔).
    const remaining = (item: { id: string; quantity: number; price: number; soldOut?: boolean }) => (item.soldOut || (!post?.giveaway && item.price === 0)) ? 0 : item.quantity - (soldItems[item.id] ?? 0);
    // Derived from state, not the store: the React Compiler memoizes this line by its inputs, so a store read here would go stale after a sale.
    const sold = completedBuyer !== null || (!!post && post.items.length > 0 && post.items.every(item => remaining(item) < 1));
    const isBuyer = completedBuyer === viewerId || purchased; // the paying account keeps chat after a sell-out
    const showQuestions = !!post?.directBuy && !isOwnPost && !canChat && !sold;
    const openQuestions = () => {
        questionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        questionsRef.current?.focus({ preventScroll: true });
    };
    const returnToSelection = useCallback(() => {
        setCheckout(false);
        requestAnimationFrame(() => {
            itemsRef.current?.scrollIntoView({ block: 'center' });
            itemsRef.current?.focus({ preventScroll: true });
        });
    }, []);
    const buy = () => {
        if (purchased) setCheckout(true); // An existing order opens its status page without reselecting.
        else if (!selectedItems.length) {
            setSelectionError(true);
            itemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            itemsRef.current?.focus({ preventScroll: true });
        } else setCheckout(true);
    };
    const galleryRef = useRef<HTMLDivElement>(null);
    const changePhoto = (index: number) => galleryRef.current?.scrollTo({ left: index * galleryRef.current.clientWidth, behavior: 'smooth' });
    const thumbnail = post?.photos[0] ? <img src={post.photos[0].src} alt="" /> : undefined;
    const recommendations = post?.recommendationKind === 'games' ? gamePostRecommendations : macbookBundle;
    return <>
    <section className="product-detail published-post" data-closing={closing} inert={closing || checkout || chat} onAnimationEnd={event => { if (event.target === event.currentTarget && closing) onBack(); }} data-buyer-selection={planned && !isOwnPost && selectedItems.length > 0} data-owner-direct-buy={isOwnPost && post?.directBuy} aria-label={post ? `${post.title} 상세페이지` : '게시글 상세'}>
        <header className="detail-bar"><button type="button" aria-label="뒤로 가기" onClick={close}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m15 3-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button><button type="button" aria-label="홈으로" onClick={close}><FeedIcon name="home" /></button>{post && <><div className="detail-bar-spacer" />{post.builtIn ? <button type="button" aria-label="게시글 메뉴" disabled><FeedIcon name="more" /></button> : <PostMenu label="게시글" onDelete={onDelete} />}</>}</header>
        <main className="detail-scroll" tabIndex={0} aria-label="작성한 게시글 내용">
            {!post ? <p className="published-empty" role="status">{error ? '게시글을 불러오지 못했어요. 새로고침 후 다시 확인해주세요.' : '이 브라우저에 저장된 게시글이 없어요.'}</p> : <>
                {post.photos.length > 0 && <div className="detail-gallery-wrap">
                    <div className="detail-gallery" ref={galleryRef} aria-label="상품 사진" tabIndex={0} onScroll={event => setPhotoIndex(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))} onKeyDown={event => {
                        if (event.key === 'ArrowRight') { event.preventDefault(); changePhoto(Math.min(post.photos.length - 1, photoIndex + 1)); }
                        if (event.key === 'ArrowLeft') { event.preventDefault(); changePhoto(Math.max(0, photoIndex - 1)); }
                    }}>{post.photos.map((photo, index) => <div className="detail-gallery-slide" key={photo.id}><img className="published-photo" src={photo.src} alt={`${post.title} 사진 ${index + 1}`} /></div>)}</div>
                    {post.photos.length > 1 && <><button type="button" className="detail-photo-arrow detail-photo-previous" aria-label="이전 상품 사진" disabled={photoIndex === 0} onClick={() => changePhoto(photoIndex - 1)}>‹</button><button type="button" className="detail-photo-arrow detail-photo-next" aria-label="다음 상품 사진" disabled={photoIndex === post.photos.length - 1} onClick={() => changePhoto(photoIndex + 1)}>›</button><span className="detail-photo-count">{photoIndex + 1} / {post.photos.length}</span></>}
                </div>}
                {post.directBuy && <div className="detail-delivery"><FeedIcon name="shopping" /><span>바로구매로 등록한 물품이에요.</span></div>}
                <div className="detail-seller"><div className="detail-avatar"><FeedIcon name="person" /></div><div><strong>{post.author.nickname}</strong><p>{post.author.neighborhood}</p></div>{post.temperature && <div className="detail-temperature"><strong>{post.temperature} <span>{post.mood}</span></strong><span className="detail-temperature-label">매너온도</span></div>}{isOwnPost && <Badge className="published-own" size="medium" tone="neutral" variant="weak">내 게시글</Badge>}</div>
                <article className="detail-description"><h1 className="detail-title">{sold && <span className="detail-sold-badge">거래완료</span>}{post.title}</h1><p className="detail-price">{postPriceLabel(post)}</p><p className="detail-category"><span>{post.category}</span> · {post.ageLabel ?? postAge(post.createdAt)}</p><div className="detail-body-copy"><p>{post.description}</p></div>
                    {planned && <section className="published-items" ref={itemsRef} tabIndex={-1} aria-label="구매 물품 선택"><h2>{isOwnPost ? '판매 물품' : '이 게시글의 물품'}{post.items.length > 1 && <> <span>{post.items.length}종</span></>}</h2>
                        {selectionError && <p className="selection-error" role="alert">구매할 물품을 선택해주세요.</p>}
                        {post.items.map(item => <div className="published-item" data-selected={!isOwnPost && !!quantities[item.id]} data-sold-out={remaining(item) < 1} key={item.id}>
                            {!isOwnPost && <input type="checkbox" aria-label={`${item.name} 선택`} checked={!!quantities[item.id]} disabled={remaining(item) < 1} onChange={event => { setQuantities(current => ({ ...current, [item.id]: event.target.checked ? 1 : 0 })); setSelectionError(false); }} />}
                            <div className="published-item-name"><strong>{item.name}</strong><p>{remaining(item) < 1 ? '판매완료' : `수량 ${remaining(item)}개`}</p>
                                {!isOwnPost && !!quantities[item.id] && remaining(item) > 1 && <div className="purchase-quantity" aria-label="구매 수량">
                                    <button type="button" aria-label={`${item.name} 수량 줄이기`} disabled={quantities[item.id] <= 1} onClick={() => setQuantities(current => ({ ...current, [item.id]: Math.max(1, current[item.id] - 1) }))}>−</button>
                                    <output aria-label={`${item.name} 구매 수량`}>{quantities[item.id]}</output>
                                    <button type="button" aria-label={`${item.name} 수량 늘리기`} disabled={quantities[item.id] >= remaining(item)} onClick={() => setQuantities(current => ({ ...current, [item.id]: Math.min(remaining(item), current[item.id] + 1) }))}>+</button>
                                </div>}
                            </div><b>{post.giveaway ? '나눔' : item.price === 0 ? '판매완료' : `${item.price.toLocaleString('ko-KR')}원`}<small>{post.giveaway || item.price === 0 ? '' : ' /개'}</small></b>
                        </div>)}
                    </section>}
                    <section className="detail-meeting" aria-label="거래 희망 장소"><p><strong>거래 희망 장소</strong> {post.author.tradePlace} <span>›</span></p>{post.mapPhoto ? <img className="published-map" src={post.mapPhoto} alt={`${post.author.tradePlace} 거래 희망 장소 지도`} /> : <SourceImage photo={region("224027335", 16, 272, 408, 120)} label={`${post.author.tradePlace} 거래 희망 장소 지도`} />}</section>
                    {(post.chats !== undefined || post.likes !== undefined || post.views !== undefined) && <p className="detail-stats">{post.chats !== undefined && <>채팅 {post.chats} · </>}{post.likes !== undefined && <>관심 {post.likes} · </>}{post.views !== undefined && <>조회 {post.views.toLocaleString('ko-KR')}</>}</p>}
                    {post.secondary && <p className="published-setting">함께 올린 동네 <strong>{post.author.secondaryNeighborhood}</strong></p>}
                    {post.offers && <p className="published-setting">가격 제안을 받을 수 있어요.</p>}
                    {post.giveawayRequests && <p className="published-setting">나눔 신청을 받는 물품이에요.</p>}
                    {showQuestions && <section className="detail-questions published-questions" ref={questionsRef} aria-label="채팅없이 질문하기" tabIndex={-1}>
                        <h2><span className="detail-question-symbol">Q</span> 채팅없이 질문하기</h2>
                        <p>궁금한 점을 선택하면, 공개 답변을 받을 수 있어요</p>
                        <div className="detail-question-chips">
                            {['구성품', '개봉, 하자 여부', '정품 여부, 에디션', '작동 여부', '호환 기종, 언어'].map(label => <Chip.Root key={label} variant="outlineWeak" size="medium" disabled><Chip.Label>{label}</Chip.Label></Chip.Root>)}
                        </div>
                    </section>}
                </article>
                {post.recommendationKind === 'books' ? <section className="detail-section detail-bottom-ads"><h2>보고 있는 물품과 비슷한 물품 <DetailIcon name="chevron" /></h2><Cards items={bookPostSimilar} /></section> : <>
                    <section className="detail-section"><h2>{viewerName}님을 위한 새 상품 · 광고 <span className="detail-info">ⓘ</span></h2><Cards items={recommendations.topAds} variant="rail" /></section>
                    <section className="detail-section"><h2>보고 있는 물품과 비슷한 물품 <DetailIcon name="chevron" /></h2><Cards items={recommendations.similar} /></section>
                    <section className="detail-keyword"><p>이웃들이 <strong>{recommendations.keyword}</strong> 게시글을 올리면<br />바로 알려드릴까요?</p><ActionButton variant="neutralWeak" size="small" disabled><FeedIcon name="bell" />알림 받기</ActionButton></section>
                    <section className="detail-section"><h2>{post.author.nickname}님의 판매 물품 <DetailIcon name="chevron" /></h2><Cards items={recommendations.sellerItems} /></section>
                    <section className="detail-section detail-bottom-ads"><h2>{viewerName}님을 위한 새 상품 · 광고</h2><Cards items={recommendations.bottomAds} variant="ads" /><div className="detail-pagination" aria-hidden="true"><i className="active" /><i />{!post.directBuy && <i />}</div></section>
                </>}
            </>}
        </main>
        {isOwnPost && post.directBuy && <div className="published-selling-banner">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M3 2h5v7h4V2h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path fill="currentColor" d="M9 2h2v5H9z"/></svg>
            <span>바로구매로 판매중이에요.</span><button type="button" onClick={onOpenHistory} disabled={!onOpenHistory}>판매 현황</button>
        </div>}
        {planned && !isOwnPost && selectedItems.length > 0 && <div className="published-selection-summary" aria-live="polite"><span>선택한 물품 {selectedItems.length}종 · {selectedCount}개</span><strong>{post?.giveaway ? '나눔' : `${total.toLocaleString('ko-KR')}원`}</strong><small>{post?.directBuy ? '물품 합계 · 배송비와 수수료 별도' : '거래 조건은 채팅으로 확인'}</small></div>}
        <footer className="detail-footer">{isOwnPost ? <>
            <button type="button" className="detail-like" aria-label="관심 상품" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 21C7 17 2 13 2 7.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 2.5C22 13 17 17 12 21Z"/></svg></button>
            <ActionButton className="detail-question-button" variant="neutralSolid" size="large" disabled>대화중인 채팅 {post.chatCount ?? 0}</ActionButton>
        </> : post && sold && !purchased ? <>
            <button type="button" className={`detail-like ${liked ? 'is-liked' : ''}`} aria-label="관심 상품" aria-pressed={liked} onClick={() => setLikedBy(current => liked ? current.filter(id => id !== viewerId) : [...current, viewerId])}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 21C7 17 2 13 2 7.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 2.5C22 13 17 17 12 21Z"/></svg></button>
            <ActionButton className="detail-primary detail-sold" variant="brandSolid" size="large" disabled={!isBuyer} onClick={() => setChat(true)}>채팅하기</ActionButton>
        </> : post ? <>
            <button type="button" className={`detail-like ${liked ? 'is-liked' : ''}`} aria-label="관심 상품" aria-pressed={liked} onClick={() => setLikedBy(current => liked ? current.filter(id => id !== viewerId) : [...current, viewerId])}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 21C7 17 2 13 2 7.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 2.5C22 13 17 17 12 21Z"/></svg></button>
            <ActionButton className={post.directBuy ? "detail-question-button" : "detail-primary"} variant={post.directBuy ? "neutralWeak" : "brandSolid"} size="large" onClick={showQuestions ? openQuestions : () => setChat(true)}>{showQuestions ? "질문하기" : "채팅하기"}</ActionButton>
            {post.directBuy && <ActionButton className="detail-primary" variant="brandSolid" size="large" onClick={planned ? buy : () => setCheckout(true)}>바로구매</ActionButton>}
        </> : <ActionButton className="published-home" variant="brandSolid" size="large" onClick={close}>홈으로 돌아가기</ActionButton>}</footer>
    </section>
    {checkout && post && !isOwnPost && <CurrentDirectBuyFlow product={{ title: post.title, price: planned ? total : post.items[0]?.price ?? 0, category: planned ? `선택 물품 ${selectedItems.length}종 · ${selectedCount}개` : post.category, thumbnail, items: planned ? selectedItems.map(item => ({ name: item.name, quantity: quantities[item.id], price: item.price })) : undefined }} buyerName={viewerName} address={viewerAddress} onClose={planned && !purchased ? returnToSelection : () => setCheckout(false)} purchasable initialStep={purchased ? 'status' : 'address'} onPaid={() => { recordOrder({ postKey: purchaseKey, version: planned ? 'planned' : 'current', title: post.title, imageSrc: post.photos[0]?.src, buyerId: viewerId, buyerName: viewerName, buyerNeighborhood: viewerAddress, sellerId: post.author.id ?? '', sellerName: post.author.nickname, sellerNeighborhood: post.author.neighborhood, items: planned ? selectedItems.map(item => ({ id: item.id, name: item.name, quantity: quantities[item.id], price: item.price })) : post.items.slice(0, 1).map(item => ({ id: item.id, name: item.name, quantity: 1, price: item.price })) }); markPurchased(purchaseKey, viewerId); setPurchased(true); if (planned) { addOrder(purchaseKey, Object.fromEntries(selectedItems.map(item => [item.id, quantities[item.id]]))); setSoldItems(getSoldItems(purchaseKey)); setQuantities({}); } /* A paid single-item post, or a planned post whose last item just sold, is a completed sale for the seller's 판매관리 (2026-09-23). */ if (!planned || isSoldOut(purchaseKey, post.items)) { markCompleted(purchaseKey, viewerId); setCompletedBuyer(viewerId); } }} onCancelled={() => { cancelBuyerOrders(purchaseKey, viewerId); clearPurchase(purchaseKey); setPurchased(false); if (planned) { cancelOrder(purchaseKey); setSoldItems(getSoldItems(purchaseKey)); } clearCompleted(purchaseKey); setCompletedBuyer(null); }} />}
    {chat && post && <ChatRoom partner={{ nickname: post.author.nickname, neighborhood: post.author.neighborhood }} product={{ title: post.title, price: postPriceLabel(post), thumbnail, offers: post.offers }} viewerName={viewerName} completed={sold || purchased} onComplete={() => { markCompleted(purchaseKey, viewerId); setCompletedBuyer(viewerId); }} onClose={() => setChat(false)} />}
    </>;
}
