import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { prototypeUsers } from "./data/userData";
import { usePrototypeUser } from "./data/usePrototypeUser";
import { DeviceFrame } from "./preview/DeviceFrame";
import { deletePost, loadPosts, type PublishedPost } from "./data/publishedPosts";
import { PublishedPostDetail } from "./screens/posts/PublishedPostDetail";
import { HomeScreen } from "./screens/HomeScreen";
import { WritingFlow } from "./screens/write/WritingFlow";
import { ProductDetail } from "./screens/detail/ProductDetail";
import { isProductId, productDetails, type ProductId } from "./screens/detail/productData";
import { getSellerDistrict, sellers } from "./data/sellers";
import { isPublicDemo } from "./data/publicDemo";
import { defaultPosts } from "./data/defaultPosts";
import { MyCarrotScreen } from "./screens/account/MyCarrotScreen";
import { SalesManagementScreen } from "./screens/account/SalesManagementScreen";

function subscribeToRoute(notify: () => void) {
    window.addEventListener("hashchange", notify);
    return () => window.removeEventListener("hashchange", notify);
}
function getRoute() { return window.location.hash; }

export default function App() {
    const [posts, setPosts] = useState<PublishedPost[]>(() => defaultPosts.map(post => ({ ...post })));
    const [postsLoading, setPostsLoading] = useState(!isPublicDemo);
    const [postsError, setPostsError] = useState(false);
    useEffect(() => {
        if (isPublicDemo) return;
        let active = true;
        loadPosts().then(saved => {
            if (active) setPosts(current => [...current, ...saved.filter(post => !current.some(item => item.id === post.id))].sort((a, b) => b.createdAt - a.createdAt));
        }).catch(() => { if (active) setPostsError(true); }).finally(() => { if (active) setPostsLoading(false); });
        return () => { active = false; };
    }, []);
    const { user, activeNeighborhood, switchUser, switchGuest } = usePrototypeUser();
    // Existing local posts also follow their author's newly fixed account location.
    const displayPosts = posts.map(post => {
        const author = prototypeUsers.find(account => account.id === post.author.id);
        return author ? { ...post, secondary: false, author: { ...post.author, provinceId: author.verifiedNeighborhoods[0].provinceId, neighborhood: author.verifiedNeighborhoods[0].name, tradePlace: author.tradePlace, pickupAddress: author.pickupAddress, secondaryNeighborhood: "" } } : post;
    });
    useLayoutEffect(() => {
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
        return () => { window.history.scrollRestoration = previous; };
    }, []);
    const rawRoute = useSyncExternalStore(subscribeToRoute, getRoute);
    const blockedWriteRoute = isPublicDemo && (rawRoute === "#/write" || rawRoute === "#/planned/write");
    const route = blockedWriteRoute ? (rawRoute.startsWith("#/planned") ? "#/planned/" : "#/") : rawRoute;
    useLayoutEffect(() => {
        if (blockedWriteRoute) window.location.replace(route);
    }, [blockedWriteRoute, route]);
    const planned = route.startsWith("#/planned");
    const version = planned ? "planned" : "current";
    const routePrefix = planned ? "/planned" : "";
    const screenRoute = planned ? route.replace("#/planned", "#") : route;
    const routeId = screenRoute.replace(/^#\/product\//, "");
    const productId = isProductId(routeId) ? routeId : null;
    const publishedId = screenRoute.startsWith("#/post/") ? screenRoute.slice("#/post/".length) : null;
    const versionPosts = displayPosts.filter(post => post.format === version || (!post.format && planned));
    const managedProducts = Object.entries(productDetails).map(([id, product]) => ({
        id,
        ownerId: sellers[product.sellerId].id,
        title: product.title,
        price: product.price,
        directBuy: product.directBuy,
        neighborhood: getSellerDistrict(product.sellerId).label,
        ageLabel: product.updated,
        imageSrc: product.photos[0]?.source,
        chats: product.chats,
        likes: product.likes,
        views: product.views,
    }));
    const publishedPost = publishedId ? versionPosts.find(post => post.id === publishedId) : undefined;
    // Keep the feed visible while IndexedDB/API posts load. The detail slides in only when
    // its data is ready; a completed miss still opens the existing error/empty state.
    const publishedDetailReady = publishedId !== null && (publishedPost !== undefined || !postsLoading);
    const detailOpen = productId !== null || publishedDetailReady;
    const writing = screenRoute === "#/write";
    const myCarrot = !planned && screenRoute === "#/my";
    const salesManagement = !planned && screenRoute === "#/sales";
    const accountOpen = myCarrot || salesManagement;
    const openedFromHome = useRef(false);
    const homeRef = useRef<HTMLDivElement>(null);
    const feedScrollPosition = useRef({ current: 0, planned: 0 });
    const returnFocusToWrite = useRef(writing);
    useLayoutEffect(() => {
        if (detailOpen || writing || accountOpen) return;
        const frame = requestAnimationFrame(() => {
            homeRef.current?.querySelector(".feed-scroll")?.scrollTo({ top: feedScrollPosition.current[version] });
            if (returnFocusToWrite.current) {
                homeRef.current?.querySelector<HTMLButtonElement>(".feed-write")?.focus({ preventScroll: true });
                returnFocusToWrite.current = false;
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [detailOpen, writing, accountOpen, version]);
    const openProduct = (id: ProductId) => {
        feedScrollPosition.current[version] = homeRef.current?.querySelector(".feed-scroll")?.scrollTop ?? 0;
        openedFromHome.current = true;
        window.location.hash = `${routePrefix}/product/${id}`;
    };
    const openPublishedPost = (id: string) => {
        feedScrollPosition.current[version] = homeRef.current?.querySelector(".feed-scroll")?.scrollTop ?? 0;
        openedFromHome.current = true;
        window.location.hash = `${routePrefix}/post/${id}`;
    };
    const publishedPending = useRef<string | null>(null);
    const onPublished = (post: PublishedPost) => {
        setPosts(current => [post, ...current.filter(item => item.id !== post.id)]);
        setPostsError(false);
        feedScrollPosition.current[post.format ?? 'planned'] = 0;
        homeRef.current?.querySelector(".feed-scroll")?.scrollTo({ top: 0 });
        // The sheet slides down first; closeProduct then opens the new post from the feed.
        publishedPending.current = post.id;
    };
    const openWrite = () => {
        if (isPublicDemo) return;
        returnFocusToWrite.current = true;
        feedScrollPosition.current[version] = homeRef.current?.querySelector(".feed-scroll")?.scrollTop ?? 0;
        openedFromHome.current = true;
        window.location.hash = `${routePrefix}/write`;
    };
    const openMy = () => { openedFromHome.current = true; window.location.hash = "/my"; };
    const openSales = () => { window.location.hash = "/sales"; };
    const openHome = () => { openedFromHome.current = false; window.location.hash = "/"; };
    const closeProduct = () => {
        if (publishedPending.current) {
            const id = publishedPending.current;
            publishedPending.current = null;
            openedFromHome.current = false;
            window.location.replace(`#${routePrefix}/post/${id}`);
        } else if (openedFromHome.current) {
            openedFromHome.current = false;
            window.history.back();
        } else {
            window.location.replace(`#${routePrefix}/`);
        }
    };
    const switchVersion = () => {
        if (!detailOpen && !writing) feedScrollPosition.current[version] = homeRef.current?.querySelector(".feed-scroll")?.scrollTop ?? 0;
        openedFromHome.current = false;
        // Seed the new version once; later draft saves belong to that version only.
        if (!planned) {
            try {
                if (localStorage.getItem("re-carrot.write-draft.planned.v1") === null)
                    localStorage.setItem("re-carrot.write-draft.planned.v1", localStorage.getItem("re-carrot.write-draft.v1") ?? "null");
            } catch { /* Switching still works without persistent storage. */ }
        }
        window.location.hash = planned ? (publishedId ? "/" : screenRoute.slice(1) || "/") : `/planned${publishedId ? "/" : screenRoute.slice(1) || "/"}`;
    };
    const removePost = (id: string) => {
        if (isPublicDemo) return;
        setPosts(current => current.filter(post => post.id !== id));
        deletePost(id).catch(() => setPostsError(true));
        if (publishedId === id) { openedFromHome.current = false; window.location.replace(`#${routePrefix}/`); }
    };
    return <DeviceFrame userName={user.nickname} onSwitchUser={switchUser} onSwitchGuest={switchGuest} version={version} onSwitchVersion={switchVersion}>
        {/* Keep the feed mounted so returning from a product preserves its scroll position. */}
        <div className="prototype-home" ref={homeRef} inert={detailOpen || writing || accountOpen}>
            <HomeScreen key={version} readOnly={isPublicDemo} publishedPosts={versionPosts} postsLoading={postsLoading} postsError={postsError} onOpenPublishedPost={openPublishedPost} onDeletePost={removePost} routePrefix={routePrefix} onOpenWrite={openWrite} onOpenMy={openMy} onOpenProduct={openProduct} activeNeighborhood={activeNeighborhood.name} secondaryNeighborhood={user.verifiedNeighborhoods.find((item) => item.id !== activeNeighborhood.id)?.name} />
        </div>
        {myCarrot && <MyCarrotScreen userName={user.nickname} temperature="40.8°C" onHome={openHome} onOpenSales={openSales} />}
        {salesManagement && <SalesManagementScreen posts={versionPosts} products={managedProducts} ownerId={user.id} onBack={() => { window.location.hash = "/my"; }} />}
        {!isPublicDemo && writing && <WritingFlow user={user} key={version} onPublished={onPublished} planned={planned} draftKey={planned ? "re-carrot.write-draft.planned.v1" : "re-carrot.write-draft.v1"} neighborhood={activeNeighborhood.name} secondaryNeighborhood={user.verifiedNeighborhoods.find(item => item.id !== activeNeighborhood.id)?.name} onClose={closeProduct} />}
        {publishedDetailReady && publishedId && <PublishedPostDetail planned={planned} viewerId={user.id} viewerName={user.nickname} viewerAddress={user.pickupAddress} viewerProvinceId={activeNeighborhood.provinceId} key={`${publishedId}-${user.id}`} post={publishedPost} error={postsError} onBack={closeProduct} onDelete={() => removePost(publishedId)} />}
        {productId && <ProductDetail key={`${version}-${productId}`} planned={planned} productId={productId} viewerId={user.id} viewerName={user.nickname} viewerAddress={user.pickupAddress} activeNeighborhood={activeNeighborhood} onBack={closeProduct} />}
    </DeviceFrame>;
}
