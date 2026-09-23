import { useState } from "react";
import type { PublishedPost } from "../../data/publishedPosts";
import { getCompletedBuyer, hasSales, isSoldOut, resetDeal } from "../checkout/purchases";
import { FeedIcon } from "../home/FeedIcon";
import { createSalesListings, type ManagedProduct } from "./salesListings";
import "./account.css";

type Tab = "selling" | "completed" | "hidden";

export function SalesManagementScreen({ posts, products, ownerId, productVersion, onBack }: { posts: PublishedPost[]; products: ManagedProduct[]; ownerId: string; productVersion: 'current' | 'planned'; onBack: () => void }) {
    const [tab, setTab] = useState<Tab>("selling");
    const [, setRevision] = useState(0);
    const [menuKey, setMenuKey] = useState<string | null>(null);
    const listings = createSalesListings(posts, products, ownerId, productVersion);
    // 거래완료: chat completion, a paid single-item sale, or any paid item on a planned post (2026-09-23).
    // 판매중 keeps a planned post while items remain, so a partially sold post shows in both tabs.
    const postByKey = new Map(posts.map(post => ['post:' + post.id, post]));
    const completed = listings.filter(item => getCompletedBuyer(item.key) !== null || hasSales(item.key));
    const stillSelling = (key: string) => { const post = postByKey.get(key); return getCompletedBuyer(key) === null && (post ? !isSoldOut(key, post.items) : !hasSales(key)); };
    const grouped = { selling: listings.filter(item => stillSelling(item.key)), completed, hidden: [] as typeof listings };
    const visible = grouped[tab];
    const restore = (key: string) => {
        resetDeal(key);
        setMenuKey(null);
        setRevision(value => value + 1);
    };
    return <div className="sales-screen">
        <header className="sales-header"><button type="button" aria-label="뒤로" onClick={onBack}>‹</button><h1>판매관리</h1><button type="button" disabled>글쓰기</button></header>
        <div className="sales-tabs" role="tablist" aria-label="판매 상태">
            <button role="tab" aria-selected={tab === "selling"} onClick={() => setTab("selling")}>판매중 {grouped.selling.length}</button>
            <button role="tab" aria-selected={tab === "completed"} onClick={() => setTab("completed")}>거래완료 {grouped.completed.length}</button>
            <button role="tab" aria-selected={tab === "hidden"} onClick={() => setTab("hidden")}>숨김 0</button>
        </div>
        <main className="sales-scroll">
            {visible.length === 0 && <div className="sales-empty">{tab === "completed" ? "거래완료된 게시글이 없어요." : tab === "hidden" ? "숨긴 게시글이 없어요." : "판매중인 게시글이 없어요."}</div>}
            {visible.map(item => <article className="sales-card" key={item.key}>
                <div className="sales-card-state">{tab === "completed" ? "거래완료" : <>판매중 {item.directBuy && <em><FeedIcon name="shopping" />바로구매</em>}</>}</div>
                <button className="sales-card-menu" type="button" aria-label={item.title + " 메뉴"} aria-expanded={menuKey === item.key} onClick={() => setMenuKey(value => value === item.key ? null : item.key)}><FeedIcon name="more" /></button>
                {menuKey === item.key && <div className="sales-menu">{tab === "completed" ? <button type="button" onClick={() => restore(item.key)}>판매중으로 변경</button> : <button type="button" disabled>게시글 관리</button>}</div>}
                <div className="sales-summary">{item.imageSrc ? <img src={item.imageSrc} alt="" /> : <span><FeedIcon name="shopping" /></span>}<div><h2>{item.title}</h2><p>{item.neighborhood} · {item.ageLabel}</p><strong>{item.price}</strong></div></div>
                <div className="sales-metrics"><span>◉ {item.views}</span><span>● {item.chats}</span><span>♥ {item.likes}</span></div>
                {tab === "selling" ? <div className="sales-actions"><button disabled>끌어올리기</button><button disabled>홍보하기</button></div> : <button className="sales-review" disabled>받은 후기 보기</button>}
            </article>)}
        </main>
    </div>;
}
