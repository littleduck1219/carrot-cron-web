import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { usePrototypeUser } from "./data/usePrototypeUser";
import { NeighborhoodSwitcher } from "./preview/NeighborhoodSwitcher";
import { DeviceFrame } from "./preview/DeviceFrame";
import { HomeScreen } from "./screens/HomeScreen";
import { ProductDetail } from "./screens/detail/ProductDetail";
import { isProductId, type ProductId } from "./screens/detail/productData";

function subscribeToRoute(notify: () => void) {
    window.addEventListener("hashchange", notify);
    return () => window.removeEventListener("hashchange", notify);
}
function getRoute() { return window.location.hash; }

export default function App() {
    const { user, activeNeighborhood, selectNeighborhood } = usePrototypeUser();
    useLayoutEffect(() => {
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
        return () => { window.history.scrollRestoration = previous; };
    }, []);
    const route = useSyncExternalStore(subscribeToRoute, getRoute);
    const routeId = route.replace(/^#\/product\//, "");
    const productId = isProductId(routeId) ? routeId : null;
    const openedFromHome = useRef(false);
    const homeRef = useRef<HTMLDivElement>(null);
    const feedScrollPosition = useRef(0);
    useLayoutEffect(() => {
        if (productId) return;
        const frame = requestAnimationFrame(() => {
            homeRef.current?.querySelector(".feed-scroll")?.scrollTo({ top: feedScrollPosition.current });
        });
        return () => cancelAnimationFrame(frame);
    }, [productId]);
    const openProduct = (id: ProductId) => {
        feedScrollPosition.current = homeRef.current?.querySelector(".feed-scroll")?.scrollTop ?? 0;
        openedFromHome.current = true;
        window.location.hash = `/product/${id}`;
    };
    const closeProduct = () => {
        if (openedFromHome.current) {
            openedFromHome.current = false;
            window.history.back();
        } else {
            window.location.replace("#/");
        }
    };
    return <DeviceFrame controls={<NeighborhoodSwitcher user={user} onSelect={selectNeighborhood} />}>
        {/* Keep the feed mounted so returning from a product preserves its scroll position. */}
        <div className="prototype-home" ref={homeRef} hidden={productId !== null}>
            <HomeScreen onOpenProduct={openProduct} activeNeighborhood={activeNeighborhood.name} secondaryNeighborhood={user.verifiedNeighborhoods.find((item) => item.id !== activeNeighborhood.id)?.name} />
        </div>
        {productId && <ProductDetail key={productId} productId={productId} viewerName={user.nickname} activeNeighborhood={activeNeighborhood} onBack={closeProduct} />}
    </DeviceFrame>;
}
