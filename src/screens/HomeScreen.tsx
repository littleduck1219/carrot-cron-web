import { getSellerDistrict } from "../data/sellers";
import { ActionButton, Badge, Chip, Text } from "@seed-design/react";
import type { CSSProperties } from "react";
import { FeedIcon, type FeedIconName } from "./home/FeedIcon";
import { homeItems } from "./home/homeItems";
import "./HomeScreen.css";
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
export function HomeScreen({ onOpenProduct, activeNeighborhood, secondaryNeighborhood }: { onOpenProduct: (id: ProductId) => void; activeNeighborhood: string; secondaryNeighborhood?: string }) {
    return (
        <div className="home-feed">
            <header className="feed-header">
                <h1 className="feed-location"><FeedIcon name="pin" /><span>{activeNeighborhood}</span></h1>
                {secondaryNeighborhood && <span className="feed-secondary-location">{secondaryNeighborhood}</span>}
                <div className="feed-header-actions">
                    <button type="button" className="feed-icon-button" aria-label="검색" disabled><FeedIcon name="search" /></button>
                    <button type="button" className="feed-icon-button feed-notification" aria-label="새 알림 있음" disabled><FeedIcon name="bell" /></button>
                    <button type="button" className="feed-icon-button" aria-label="전체 메뉴" disabled><FeedIcon name="menu" /></button>
                </div>
            </header>

            <div className="feed-filters" aria-label="홈 피드 필터">
                {filters.map((label, index) => (
                    <Chip.Root key={label} size="large" className="feed-filter" aria-pressed={index === 0} disabled={index !== 0}>
                        <Chip.Label>{label}</Chip.Label>
                    </Chip.Root>
                ))}
            </div>

            <main className="feed-scroll" aria-label="동네 상품 목록" tabIndex={0}>
                <ul className="feed-list">
                    {homeItems.map((item) => (
                        <li className="feed-item" key={item.id}>
                            {isProductId(item.id) && <a className="feed-item-link" href={`#/product/${item.id}`} aria-label={`${item.title} 상세 보기`} onClick={(event) => {
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
                                    {item.reserved && <Badge tone="positive" variant="solid" size="large" className="feed-reserved-badge">예약중</Badge>}
                                    <Text as="p" className="feed-item-price">{item.price}</Text>
                                </div>}
                                {item.directBuy && (
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
                    ))}
                </ul>
            </main>

            <ActionButton className="feed-write" variant="brandSolid" size="large" disabled>
                <FeedIcon name="plus" />글쓰기
            </ActionButton>
            <nav className="feed-navigation" aria-label="하단 내비게이션">
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
