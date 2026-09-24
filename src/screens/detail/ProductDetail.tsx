import { sellers, getSellerDistrict } from "../../data/sellers";
import type { Neighborhood } from "../../data/userData";
import { ActionButton, Chip, Text } from "@seed-design/react";
import { useEffect, useRef, useState } from "react";
import { FeedIcon } from "../home/FeedIcon";
import { productDetails, region, type ProductCard, type ProductId, type SourceRegion } from "./productData";
import { CurrentDirectBuyFlow } from "../checkout/CurrentDirectBuyFlow";
import { cancelBuyerOrders, clearCompleted, clearPurchase, getCompletedBuyer, isPurchased, markCompleted, markPurchased, recordOrder } from "../checkout/purchases";
import { ChatRoom } from "../chat/ChatRoom";
import "./ProductDetail.css";

export function DetailIcon({ name }: { name: "back" | "share" | "home" | "heart" | "chevron" }) {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {name === "back" && <path d="m15 3-9 9 9 9" />}
        {name === "share" && <><path d="M12 16V2m-6 6 6-6 6 6M4 14v7h16v-7" /></>}
        {name === "home" && <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />}
        {name === "heart" && <path d="M12 21C7 17 2 13 2 7.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10 2.5C22 13 17 17 12 21Z" />}
        {name === "chevron" && <path d="m9 4 8 8-8 8" />}
    </svg>;
}

/** Display a region of the unchanged source; semantic controls overlay the captured hero toolbar. */
export function SourceImage({ photo, label, eager = false }: { photo: SourceRegion; label: string; eager?: boolean }) {
    return <div className="detail-source-image" role="img" aria-label={label} style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <img src={photo.source} alt="" aria-hidden="true" draggable={false} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} style={{
            width: `${440 / photo.width * 100}%`, left: `${-photo.x / photo.width * 100}%`, top: `${-photo.y / photo.height * 100}%`,
        }} />
    </div>;
}

export function Cards({ items, variant = "grid" }: { items: ProductCard[]; variant?: "grid" | "rail" | "ads" }) {
    return <div className={`detail-cards detail-cards-${variant}`}>
        {items.map((item, index) => <article className="detail-card" key={`${item.title}-${index}`}>
            <SourceImage photo={item.photo} label={item.title} />
            <Text as="p" className="detail-card-title">{item.reserved && <span className="detail-card-reserved">예약중 </span>}{item.title}</Text>
            {item.price && <Text as="p" className="detail-card-price">{item.discount && <span className="detail-card-discount">{item.discount} </span>}{item.price}</Text>}
            {item.oldPrice && <Text as="p" className="detail-card-old-price">{item.oldPrice}</Text>}
            {item.meta && <Text as="p" className="detail-card-meta">{item.meta}</Text>}
        </article>)}
    </div>;
}

export function ProductDetail({ productId, onBack, viewerId, viewerName, viewerAddress, activeNeighborhood, planned = false }: { productId: ProductId; onBack: () => void; viewerId: string; viewerName: string; viewerAddress: string; activeNeighborhood: Neighborhood; planned?: boolean }) {
    const product = productDetails[productId];
    const seller = sellers[product.sellerId];
    const sellerDistrict = getSellerDistrict(product.sellerId);
    const directBuy = product.directBuy;
    // User-approved simplification: compare selected verified region IDs, without a radius.
    // A paid direct purchase opens chat even across regions (user rule, 2026-09-17). Both versions pay; the record is per version.
    const purchaseKey = `${planned ? 'planned' : 'current'}:${productId}`;
    const [purchased, setPurchased] = useState(() => isPurchased(purchaseKey, viewerId));
    const canChat = purchased || (activeNeighborhood.isVerified && activeNeighborhood.provinceId === sellerDistrict.provinceId);
    // Completed deal (set from the chat's hidden control): title gets 거래완료 and only the buyer can still chat.
    const [completedBuyer, setCompletedBuyer] = useState(() => getCompletedBuyer(purchaseKey));
    const sold = completedBuyer !== null;
    const isBuyer = completedBuyer === viewerId || purchased;
    const [liked, setLiked] = useState(product.initiallyLiked);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [atTop, setAtTop] = useState(true);
    const [checkout, setCheckout] = useState(false);
    const [chat, setChat] = useState(false);
    // Leaving slides the screen back out to the right; onBack runs once that animation ends.
    const [closing, setClosing] = useState(false);
    const close = () => setClosing(true);
    useEffect(() => { document.title = `${product.title} · RE:carrot`; return () => { document.title = "RE:carrot · 홈 피드"; }; }, [product.title]);
    const galleryRef = useRef<HTMLDivElement>(null);
    const questionsRef = useRef<HTMLElement>(null);
    const changePhoto = (index: number) => {
        const gallery = galleryRef.current;
        if (gallery) gallery.scrollTo({ left: index * gallery.clientWidth, behavior: "smooth" });
    };

    const thumbnail = <SourceImage photo={product.photos[0]} label={`${product.title} 대표 사진`} eager />;
    return <>
    <section className="product-detail" data-at-top={atTop} data-closing={closing} inert={closing || checkout || chat} onAnimationEnd={event => { if (event.target === event.currentTarget && closing) onBack(); }} aria-label={`${product.title} 상세페이지`}>
        <header className="detail-bar">
            <button type="button" aria-label="뒤로 가기" onClick={close}><DetailIcon name="back" /></button>
            <button type="button" aria-label="홈으로" onClick={close}><DetailIcon name="home" /></button>
            <div className="detail-bar-spacer" />
            <button type="button" aria-label="공유" disabled><DetailIcon name="share" /></button>
            <button type="button" aria-label="게시글 메뉴" disabled><FeedIcon name="more" /></button>
        </header>
        <main className="detail-scroll" aria-label="상품 상세 내용" tabIndex={0} onScroll={(event) => setAtTop(event.currentTarget.scrollTop < 1)}>
            <div className="detail-gallery-wrap">
                <div className="detail-gallery" ref={galleryRef} tabIndex={0} aria-label="상품 사진" onScroll={(event) => {
                    const gallery = event.currentTarget;
                    setPhotoIndex(Math.round(gallery.scrollLeft / gallery.clientWidth));
                }} onKeyDown={(event) => {
                    if (event.key === "ArrowRight") { event.preventDefault(); changePhoto(Math.min(product.photos.length - 1, photoIndex + 1)); }
                    if (event.key === "ArrowLeft") { event.preventDefault(); changePhoto(Math.max(0, photoIndex - 1)); }
                }}>
                    {product.photos.map((photo, index) => <div className="detail-gallery-slide" key={photo.source}>
                        <SourceImage photo={photo} label={`${product.title} 사진 ${index + 1}`} eager={index === 0} />
                    </div>)}
                </div>
                {product.photos.length > 1 && <>
                    <button className="detail-photo-arrow detail-photo-previous" type="button" aria-label="이전 상품 사진" disabled={photoIndex === 0} onClick={() => changePhoto(photoIndex - 1)}>‹</button>
                    <button className="detail-photo-arrow detail-photo-next" type="button" aria-label="다음 상품 사진" disabled={photoIndex === product.photos.length - 1} onClick={() => changePhoto(photoIndex + 1)}>›</button>
                </>}
                {product.photoTotal > 1 && <span className="detail-photo-count" aria-live="polite">{photoIndex + 1} / {product.photoTotal}</span>}
            </div>

            {directBuy && <div className="detail-delivery"><FeedIcon name="shopping" /><span>집 앞으로 배송받는 바로구매 물품이에요.</span><DetailIcon name="chevron" /></div>}
            <div className="detail-seller">
                <div className="detail-avatar"><FeedIcon name="person" /></div>
                <div><strong>{seller.nickname}</strong><p>{sellerDistrict.label}</p></div>
                <div className={`detail-temperature ${directBuy ? "detail-temperature-warm" : ""}`}><strong>{product.temperature} <span>{product.mood}</span></strong><span className="detail-temperature-label">매너온도</span></div>
            </div>

            <article className="detail-description">
                <Text as="h1" className="detail-title">{sold && <span className="detail-sold-badge">거래완료</span>}{product.title}</Text>
                <div className="detail-price-line"><Text as="p" className="detail-price">{product.price}</Text>{!sold && <span className="detail-pay"><i />●pay</span>}
                    {!directBuy && !sold && <button type="button" className="detail-price-offer" disabled>가격 제안하기</button>}
                </div>
                {directBuy && product.extraCost && <button type="button" className="detail-cost" disabled>바로구매 이용 시 약 {product.extraCost} 추가 <span>⌄</span></button>}
                <p className="detail-category"><span>{product.category}</span> · {product.updated}</p>
                <div className="detail-body-copy">{product.description.map((paragraph, index) => paragraph === "—" ? <hr className="detail-body-divider" key={index} /> : <p key={index}>{paragraph}</p>)}</div>
                {directBuy ? <>
                    {product.contentsAnswer && <p className="detail-contents"><strong>구성품</strong> {product.contentsAnswer}</p>}
                    {!canChat && product.questions && <section className="detail-questions" ref={questionsRef} aria-label="채팅없이 질문하기" tabIndex={-1}>
                        <h2><span className="detail-question-symbol">Q</span> 채팅없이 질문하기</h2>
                        <p>궁금한 점을 선택하면, 공개 답변을 받을 수 있어요</p>
                        <div className="detail-question-chips">
                            {product.questions.map(({ label, answered }) => <Chip.Root key={label} variant="outlineWeak" size="medium" disabled className={answered ? "detail-question-answered" : ""}>
                                <Chip.Label>{label}{answered && <small> 답변완료</small>}</Chip.Label>
                            </Chip.Root>)}
                        </div>
                    </section>}
                </> : <section className="detail-meeting" aria-label="거래 희망 장소">
                    <p><strong>거래 희망 장소</strong> 파리바게트 <span>›</span></p>
                    <SourceImage photo={region("224027335",16,272,408,120)} label="파리바게트 거래 희망 장소 지도, 서울대입구역 근처" />
                    <p className="detail-distance">700m 근처에서 거래할 수 있어요</p>
                </section>}
                <p className="detail-stats">{product.chats !== undefined && <>채팅 {product.chats} · </>}관심 {product.likes + Number(liked) - Number(product.initiallyLiked)} · 조회 {product.views.toLocaleString("ko-KR")}</p>
                <button type="button" className="detail-report" disabled>이 게시글 신고하기</button>
            </article>

            <section className="detail-section"><h2>{viewerName}님을 위한 새 상품 · 광고 <span className="detail-info">ⓘ</span></h2><Cards items={product.topAds} variant="rail" /></section>
            <section className="detail-section"><h2>보고 있는 물품과 비슷한 물품 <DetailIcon name="chevron" /></h2><Cards items={product.similar} /></section>
            <section className="detail-keyword"><p>이웃들이 <strong>{product.keyword}</strong> 게시글을 올리면<br />바로 알려드릴까요?</p><ActionButton variant="neutralWeak" size="small" disabled><FeedIcon name="bell" />알림 받기</ActionButton></section>
            <section className="detail-section"><h2>{seller.nickname}님의 판매 물품 <DetailIcon name="chevron" /></h2><Cards items={product.sellerItems} /></section>
            <section className="detail-section detail-bottom-ads"><h2>{viewerName}님을 위한 새 상품 · 광고</h2><Cards items={product.bottomAds} variant="ads" /><div className="detail-pagination" aria-hidden="true"><i className="active" /><i />{!directBuy && <i />}</div></section>
        </main>

        <footer className="detail-footer">
            <button type="button" className={`detail-like ${liked ? "is-liked" : ""}`} aria-label="관심 상품" aria-pressed={liked} onClick={() => setLiked(!liked)}><DetailIcon name="heart" /></button>
            {sold && !purchased ? <ActionButton variant="brandSolid" size="large" className="detail-primary detail-sold" disabled={!isBuyer} onClick={() => setChat(true)}>채팅하기</ActionButton> : directBuy ? <>
                {canChat
                    ? <ActionButton variant="neutralWeak" size="large" className="detail-question-button" onClick={() => setChat(true)}>채팅하기</ActionButton>
                    : <ActionButton variant="neutralWeak" size="large" className="detail-question-button" disabled={!product.questions} onClick={() => { questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); questionsRef.current?.focus({ preventScroll: true }); }}>질문하기</ActionButton>}
                <ActionButton variant="brandSolid" size="large" className="detail-primary" onClick={() => setCheckout(true)}>바로구매</ActionButton>
            </> : <ActionButton variant="brandSolid" size="large" className="detail-primary" onClick={() => setChat(true)}>채팅하기</ActionButton>}
        </footer>
    </section>
    {checkout && directBuy && <CurrentDirectBuyFlow product={{ title: product.title, price: Number(product.price.replace(/\D/g, '')), category: product.category, thumbnail }} buyerName={viewerName} address={viewerAddress} onClose={() => setCheckout(false)} purchasable initialStep={purchased ? 'status' : 'address'} onPaid={() => { recordOrder({ postKey: purchaseKey, version: planned ? 'planned' : 'current', title: product.title, imageSrc: product.photos[0]?.source, buyerId: viewerId, buyerName: viewerName, buyerNeighborhood: activeNeighborhood.name, sellerId: seller.id, sellerName: seller.nickname, sellerNeighborhood: sellerDistrict.label, items: [{ id: productId, name: product.title, quantity: 1, price: Number(product.price.replace(/\D/g, '')) }] }); markPurchased(purchaseKey, viewerId); setPurchased(true); markCompleted(purchaseKey, viewerId); setCompletedBuyer(viewerId); }} onCancelled={() => { cancelBuyerOrders(purchaseKey, viewerId); clearPurchase(purchaseKey); setPurchased(false); clearCompleted(purchaseKey); setCompletedBuyer(null); }} />}
    {chat && <ChatRoom partner={{ nickname: seller.nickname, temperature: product.temperature, neighborhood: sellerDistrict.label }} product={{ title: product.title, price: product.price, thumbnail, offers: !directBuy }} viewerName={viewerName} completed={sold || purchased} onComplete={() => { markCompleted(purchaseKey, viewerId); setCompletedBuyer(viewerId); }} onClose={() => setChat(false)} />}
    </>;
}
