import { useState } from "react";
import { postAge, postPriceLabel, type PublishedPost } from "../../data/publishedPosts";
import { getCompletedBuyer, resetDeal } from "../checkout/purchases";
import { FeedIcon } from "../home/FeedIcon";
import "./account.css";

type Tab = "selling" | "completed" | "hidden";

export function SalesManagementScreen({ posts, onBack }: { posts: PublishedPost[]; onBack: () => void }) {
    const [tab, setTab] = useState<Tab>("selling");
    const [, setRevision] = useState(0);
    const [menuId, setMenuId] = useState<string | null>(null);
    const completed = posts.filter(post => getCompletedBuyer("post:" + post.id) !== null);
    const grouped = { selling: posts.filter(post => !completed.includes(post)), completed, hidden: [] as PublishedPost[] };
    const visible = grouped[tab];
    const restore = (post: PublishedPost) => {
        resetDeal("post:" + post.id);
        setMenuId(null);
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
            {visible.map(post => <article className="sales-card" key={post.id}>
                <div className="sales-card-state">{tab === "completed" ? "거래완료" : <>판매중 {post.directBuy && <em><FeedIcon name="shopping" />바로구매</em>}</>}</div>
                <button className="sales-card-menu" type="button" aria-label={post.title + " 메뉴"} aria-expanded={menuId === post.id} onClick={() => setMenuId(value => value === post.id ? null : post.id)}><FeedIcon name="more" /></button>
                {menuId === post.id && <div className="sales-menu">{tab === "completed" ? <button type="button" onClick={() => restore(post)}>판매중으로 변경</button> : <button type="button" disabled>게시글 관리</button>}</div>}
                <div className="sales-summary">{post.photos[0] ? <img src={post.photos[0].src} alt="" /> : <span><FeedIcon name="shopping" /></span>}<div><h2>{post.title}</h2><p>{post.author.neighborhood} · {post.ageLabel ?? postAge(post.createdAt)}</p><strong>{postPriceLabel(post)}</strong></div></div>
                <div className="sales-metrics"><span>◉ {post.views ?? 0}</span><span>● {post.chats ?? post.chatCount ?? 0}</span><span>♥ {post.likes ?? 0}</span></div>
                {tab === "selling" ? <div className="sales-actions"><button disabled>끌어올리기</button><button disabled>홍보하기</button></div> : <button className="sales-review" disabled>받은 후기 보기</button>}
            </article>)}
        </main>
    </div>;
}
