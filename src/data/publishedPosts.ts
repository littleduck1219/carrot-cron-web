import type { SaleItem } from '../screens/write/saleItems';

export interface PostInput {
    title: string;
    description: string;
    category: string | null;
    photos: { id: string; src: string; name: string }[];
    items?: SaleItem[];
    giveaway: boolean;
    directBuy: boolean;
    offers: boolean;
    giveawayRequests: boolean;
    secondary: boolean;
}
export type PostFormat = "current" | "planned";
export interface PublishedPost {
    id: string;
    format?: PostFormat;
    createdAt: number;
    title: string;
    description: string;
    category: string;
    photos: PostInput['photos'];
    items: { id: string; name: string; price: number; quantity: number }[];
    giveaway: boolean;
    directBuy: boolean;
    offers: boolean;
    giveawayRequests: boolean;
    secondary: boolean;
    chatCount?: number;
    author: { provinceId?: string; id?: string; nickname: string; neighborhood: string; secondaryNeighborhood: string; tradePlace: string; pickupAddress: string };
}
export function validatePost(input: PostInput): { message: string; target: string } | null {
    if (!input.title.trim()) return { message: '제목을 입력해주세요.', target: '#write-title' };
    if (!input.category) return { message: '카테고리를 선택해주세요.', target: '.write-categories button' };
    if (!input.description.trim()) return { message: '자세한 설명을 입력해주세요.', target: '#write-description' };
    if (!input.items?.length) return { message: '판매할 물품을 추가해주세요.', target: '.sale-item-add' };
    for (const [index, item] of input.items.entries()) {
        if (!item.name.trim()) return { message: `물품 ${index + 1}의 이름을 입력해주세요.`, target: `#sale-name-${item.id}` };
        if (!input.giveaway && (!/^\d+$/.test(item.price) || !Number.isSafeInteger(Number(item.price)) || Number(item.price) <= 0)) return { message: `물품 ${index + 1}의 가격을 1원 이상 입력해주세요.`, target: `#sale-price-${item.id}` };
        if (item.quantity !== null && (!Number.isSafeInteger(item.quantity) || item.quantity < 1)) return { message: `물품 ${index + 1}의 수량을 확인해주세요.`, target: `#sale-quantity-${item.id}` };
    }
    return null;
}
export function createPost(input: PostInput, author: PublishedPost['author'], format: PostFormat = 'planned'): PublishedPost {
    const error = validatePost(input);
    if (error) throw new Error(error.message);
    return {
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        format, createdAt: Date.now(),
        title: input.title.trim(), description: input.description.trim(), category: input.category!,
        photos: input.photos.map(photo => ({ ...photo })),
        items: input.items!.map(item => ({ id: item.id, name: item.name.trim(), price: input.giveaway ? 0 : Number(item.price), quantity: item.quantity ?? 1 })),
        giveaway: input.giveaway, directBuy: !input.giveaway && input.directBuy,
        offers: !input.giveaway && input.offers, giveawayRequests: input.giveaway && input.giveawayRequests,
        secondary: input.secondary, author: { ...author },
    };
}
export function postPriceLabel(post: PublishedPost): string {
    if (post.giveaway) return '나눔';
    const prices = post.items.map(item => item.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? `${min.toLocaleString('ko-KR')}원` : `${min.toLocaleString('ko-KR')}~${max.toLocaleString('ko-KR')}원`;
}
export function postAge(createdAt: number): string {
    const minutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));
    return minutes < 1 ? '방금 전' : minutes < 60 ? `${minutes}분 전` : minutes < 1440 ? `${Math.floor(minutes / 60)}시간 전` : `${Math.floor(minutes / 1440)}일 전`;
}

// Photos can exceed localStorage's small quota; persist posts and images together.
function openPostsDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('re-carrot.planned-posts.v1', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('posts', { keyPath: 'id' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('게시글 저장소를 열 수 없어요. 다른 탭을 닫고 다시 시도해주세요.'));
    });
}
async function runPostTransaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const database = await openPostsDatabase();
    try {
        return await new Promise<T>((resolve, reject) => {
            const transaction = database.transaction('posts', mode);
            const request = operation(transaction.objectStore('posts'));
            transaction.oncomplete = () => resolve(request.result);
            transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error('게시글을 저장하지 못했어요.'));
            transaction.onerror = () => reject(transaction.error ?? request.error);
        });
    } finally { database.close(); }
}
// The dev server mirrors posts to data/posts.json (vite.config.ts), so they outlive browser data and show on every device.
// Without that endpoint (e.g. a static build) the browser store alone is used.
const postsApi = '/api/posts';
export async function savePost(post: PublishedPost): Promise<void> {
    await runPostTransaction('readwrite', store => store.add(post));
    await fetch(postsApi, { method: 'POST', body: JSON.stringify(post) }).catch(() => undefined);
}
export async function deletePost(id: string): Promise<void> {
    await runPostTransaction('readwrite', store => store.delete(id));
    await fetch(`${postsApi}/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => undefined);
}
export async function loadPosts(): Promise<PublishedPost[]> {
    const local = await runPostTransaction<PublishedPost[]>('readonly', store => store.getAll());
    const remote: PublishedPost[] = await fetch(postsApi)
        .then(async response => {
            const value: unknown = response.ok ? await response.json() : [];
            return Array.isArray(value) ? value.filter((post): post is PublishedPost =>
                typeof post === 'object' && post !== null &&
                typeof post.id === 'string' && typeof post.createdAt === 'number' &&
                typeof post.title === 'string' &&
                Array.isArray(post.photos) && Array.isArray(post.items) &&
                typeof post.author === 'object' && post.author !== null && typeof post.author.nickname === 'string'
            ) : [];
        })
        .catch(() => []);
    return [...remote, ...local.filter(post => !remote.some(item => item.id === post.id))].sort((a, b) => b.createdAt - a.createdAt);
}
