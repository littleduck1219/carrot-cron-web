import { postAge, postPriceLabel, type PublishedPost } from "../data/publishedPosts";
import { getCompletedBuyer, isSoldOut } from "./checkout/purchases";
import { PostMenu } from "./posts/PostMenu";
import "./posts/PublishedPosts.css";
import { getSellerDistrict } from "../data/sellers";
import { ActionButton, Badge, Chip, Text } from "@seed-design/react";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { FeedIcon, type FeedIconName } from "./home/FeedIcon";
import { homeItems } from "./home/homeItems";
import "./HomeScreen.css";
import { useDialogControls } from "./write/useDialogControls";
import { isProductId, type ProductId } from "./detail/productData";

const filters = ["전체", "중고차 ↗", "중고거래", "가까운 동네", "방금 전"];
const navigation: { label: string; icon: FeedIconName }[] = [
    { label: "홈", icon: "home" },
    { label: "커뮤니티", icon: "community" },
    { label: "동네지도", icon: "map" },
    { label: "채팅", icon: "chat" },
    { label: "나의 당근", icon: "person" },
];

/** Screenshot reproduction only. Destination screens are built in later steps. */
export function HomeScreen({ readOnly = false, publishedPosts = [], postsError = false, onOpenPublishedPost, onDeletePost, routePrefix = "", onOpenProduct, onOpenWrite, activeNeighborhood, secondaryNeighborhood }: { readOnly?: boolean; publishedPosts?: PublishedPost[]; postsError?: boolean; onOpenPublishedPost: (id: string) => void; onDeletePost: (id: string) => void; routePrefix?: string; onOpenWrite: () => void; onOpenProduct: (id: ProductId) => void; activeNeighborhood: string; secondaryNeighborhood?: string }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [headerHidden, setHeaderHidden] = useState(false);
    const lastScrollTop = useRef(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    useDialogControls(menuRef, menuOpen, closeMenu);

    return (
        <div className="home-feed">
            <div className="feed-heading-clip">
            <div className="feed-heading" data-hidden={headerHidden} inert={headerHidden || menuOpen}>
            <header className="feed-header" inert={menuOpen}>
                <h1 className="feed-location"><FeedIcon name="pin" /><span>{activeNeighborhood}</span></h1>
                {secondaryNeighborhood && <span className="feed-secondary-location">{secondaryNeighborhood}</span>}
                <div className="feed-header-actions">
                    <button type="button" className="feed-icon-button" aria-label="검색" disabled><FeedIcon name="search" /></button>
                    <button type="button" className="feed-icon-button feed-notification" aria-label="새 알림 있음" disabled><FeedIcon name="bell" /></button>
                    <button type="button" className="feed-icon-button" aria-label="전체 메뉴" disabled><FeedIcon name="menu" /></button>
                </div>
            </header>

            <div inert={menuOpen} className="feed-filters" aria-label="홈 피드 필터">
                {filters.map((label, index) => (
                    <Chip.Root key={label} size="large" className="feed-filter" aria-pressed={index === 0} disabled={index !== 0}>
                        <Chip.Label>{label}</Chip.Label>
                    </Chip.Root>
                ))}
            </div>

            </div>
            </div>
            <main inert={menuOpen} className="feed-scroll" aria-label="동네 상품 목록" tabIndex={0}
                onScroll={(event) => {
                    const element = event.currentTarget;
                    const top = Math.max(0, Math.min(element.scrollTop, element.scrollHeight - element.clientHeight));
                    setIsScrolled(top > 0);
                    if (top <= 116) { setHeaderHidden(false); lastScrollTop.current = top; }
                    else if (Math.abs(top - lastScrollTop.current) >= 6) {
                        setHeaderHidden(top > lastScrollTop.current);
                        lastScrollTop.current = top;
                    }
                }}>
                <ul className="feed-list">
                    {postsError && <li className="published-load-error" role="status">작성한 게시글을 불러오지 못했어요. 새로고침 후 다시 확인해주세요.</li>}
                    {publishedPosts.map(post => { const sold = getCompletedBuyer(`post:${post.id}`) !== null || (post.format === 'planned' && isSoldOut(`post:${post.id}`, post.items)); return <li className="feed-item" key={post.id}>
                        <a className="feed-item-link" href={`#${routePrefix}/post/${post.id}`} aria-label={`${post.title} 상세 보기`} onClick={event => { event.preventDefault(); onOpenPublishedPost(post.id); }} />
                        <div className="feed-published-thumbnail">{post.photos[0] ? <img src={post.photos[0].src} alt={post.title} /> : <FeedIcon name="shopping" />}</div>
                        <div className="feed-item-copy"><Text as="h2" className="feed-item-title feed-published-title">{post.title}</Text><Text as="p" className="feed-item-meta">{post.author.neighborhood} · {postAge(post.createdAt)}</Text><div className="feed-price-row">{sold && <span className="feed-sold-badge">거래완료</span>}<Text as="p" className="feed-item-price">{postPriceLabel(post)}</Text></div>
                            {post.directBuy && !sold && <Badge tone="brand" variant="weak" size="large" className="feed-buy-badge"><FeedIcon name="shopping" />바로구매</Badge>}
                            {post.items.length > 1 && <div className="feed-item-counts"><span>물품 {post.items.length}종</span></div>}
                        </div>
                        <PostMenu label={post.title} onDelete={() => onDeletePost(post.id)} />
                    </li>; })}
                    {homeItems.map((item) => {
                        const sold = isProductId(item.id) && getCompletedBuyer(`${routePrefix ? 'planned' : 'current'}:${item.id}`) !== null;
                        return (
                        <li className="feed-item" key={item.id}>
                            {isProductId(item.id) && <a className="feed-item-link" href={`#${routePrefix}/product/${item.id}`} aria-label={`${item.title} 상세 보기`} onClick={(event) => {
                                event.preventDefault();
                                if (isProductId(item.id)) onOpenProduct(item.id);
                            }} />}
                            <div className="feed-thumbnail" role="img" aria-label={item.imageAlt}
                                style={{
                                    "--thumbnail-y": `${item.imageY}px`,
                                    backgroundImage: item.imageSource ? `url("${item.imageSource}")` : undefined,
                                    height: item.imageHeight ?? 128,
                                    clipPath: item.imageVisibleHeight ? `inset(0 0 ${(item.imageHeight ?? 128) - item.imageVisibleHeight}px 0)` : undefined,
                                } as CSSProperties} />
                            <div className="feed-item-copy">
                                <Text as="h2" className="feed-item-title">{item.title}</Text>
                                {(item.sellerId || item.meta) && <Text as="p" className="feed-item-meta">{[item.sellerId ? getSellerDistrict(item.sellerId).label : null, item.meta].filter(Boolean).join(" · ")}</Text>}
                                {item.price && <div className="feed-price-row">
                                    {sold && <span className="feed-sold-badge">거래완료</span>}
                                    {item.reserved && <Badge tone="positive" variant="solid" size="large" className="feed-reserved-badge">예약중</Badge>}
                                    <Text as="p" className="feed-item-price">{item.price}</Text>
                                </div>}
                                {item.directBuy && !sold && (
                                    <Badge tone="brand" variant="weak" size="large" className="feed-buy-badge">
                                        <FeedIcon name="shopping" />바로구매
                                    </Badge>
                                )}
                                <div className="feed-item-counts">
                                    {item.adAction && <span className="feed-ad-action">{item.adAction}<span aria-hidden="true">›</span></span>}
                                    {item.chats !== undefined && <span aria-label={`채팅 ${item.chats}개`}><FeedIcon name="chat" />{item.chats}</span>}
                                    {item.likes !== undefined && <span aria-label={`관심 ${item.likes}개`}><FeedIcon name="heart" />{item.likes}</span>}
                                </div>
                            </div>
                            <button type="button" className="feed-item-more" aria-label={`${item.title} 더 보기`} disabled><FeedIcon name="more" /></button>
                        </li>
                        ); })}
                </ul>
            </main>

            {!readOnly && <div className="write-launcher" ref={menuRef} role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen ? true : undefined} aria-label={menuOpen ? '글쓰기 메뉴' : undefined}>
                {menuOpen && <>
                    <button className="write-menu-backdrop" tabIndex={-1} aria-label="글쓰기 메뉴 닫기" onClick={closeMenu} />
                    <div className="write-menu" id="write-menu-options">
                        <div className="write-menu-panel">
                            <button disabled><span className="write-menu-icon job"><FeedIcon name="search" /></span>알바/과외/레슨</button>
                            <button disabled><span className="write-menu-icon realty"><FeedIcon name="home" /></span>부동산</button>
                            <button disabled><span className="write-menu-icon car"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m5 3-3 8v9h3v-3h14v3h3v-9l-3-8Zm2 2h10l2 6H5Z"/><path stroke="#16171b" strokeWidth="2" d="M5 14h3m8 0h3"/></svg></span>중고차</button>
                            <button disabled><span className="write-menu-icon life"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="1" width="18" height="22" rx="3" fill="currentColor"/><path stroke="white" strokeWidth="2" d="M7 7h5m-5 5h10M7 17h10"/></svg></span>동네생활</button>
                            <button disabled><span className="write-menu-icon story"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m10 7 7 5-7 5Z" fill="white"/></svg></span>스토리</button>
                        </div>
                        <div className="write-menu-panel">
                            <button disabled><span className="write-menu-icon sell"><FeedIcon name="shopping" /></span>여러 물건 팔기</button>
                            <button onClick={() => { closeMenu(); onOpenWrite(); }}><span className="write-menu-icon sell"><FeedIcon name="shopping" /></span>내 물건 팔기</button>
                        </div>
                    </div>
                </>}
                <ActionButton className="feed-write" data-compact={isScrolled || menuOpen} data-menu-open={menuOpen} aria-label={menuOpen ? '글쓰기 메뉴 닫기' : '글쓰기'} aria-expanded={menuOpen} aria-controls={menuOpen ? 'write-menu-options' : undefined} variant="brandSolid" size="large" onClick={() => setMenuOpen(current => !current)}>
                    <FeedIcon name="plus" /><span className="feed-write-label" aria-hidden="true">글쓰기</span>
                </ActionButton>
            </div>}
            <nav inert={menuOpen} className="feed-navigation" aria-label="하단 내비게이션">
                {navigation.map(({ label, icon }, index) => (
                    <button key={label} type="button" className="feed-nav-item" aria-current={index === 0 ? "page" : undefined}
                        disabled={index !== 0} onClick={index === 0 ? () => document.querySelector(".feed-scroll")?.scrollTo({ top: 0, behavior: "smooth" }) : undefined}>
                        <FeedIcon name={icon} /><span>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
