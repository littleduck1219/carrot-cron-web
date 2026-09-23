export interface SalesPost {
    id: string;
    title: string;
    directBuy: boolean;
    author: { id?: string; neighborhood?: string };
    items: { price: number; soldOut?: boolean }[];
    photos?: { src: string }[];
    ageLabel?: string;
    chatCount?: number;
    chats?: number;
    likes?: number;
    views?: number;
}

export interface ManagedProduct {
    id: string;
    ownerId: string;
    title: string;
    price: string;
    directBuy: boolean;
    neighborhood?: string;
    ageLabel?: string;
    imageSrc?: string;
    chats?: number;
    likes?: number;
    views?: number;
}

export interface SalesListing {
    key: string;
    title: string;
    price: string;
    directBuy: boolean;
    neighborhood: string;
    ageLabel: string;
    imageSrc?: string;
    chats: number;
    likes: number;
    views: number;
}

function postPrice(post: SalesPost) {
    const active = post.items.filter(item => !item.soldOut).map(item => item.price);
    const prices = active.length ? active : post.items.map(item => item.price);
    if (!prices.length) return '가격 없음';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? min.toLocaleString('ko-KR') + '원' : min.toLocaleString('ko-KR') + '~' + max.toLocaleString('ko-KR') + '원';
}

export function createSalesListings(posts: SalesPost[], products: ManagedProduct[], ownerId: string, productVersion: 'current' | 'planned' = 'current'): SalesListing[] {
    const ownedPosts = posts.filter(post => post.author.id === ownerId).map(post => ({
        key: 'post:' + post.id,
        title: post.title,
        price: postPrice(post),
        directBuy: post.directBuy,
        neighborhood: post.author.neighborhood ?? '동네 정보 없음',
        ageLabel: post.ageLabel ?? '게시중',
        imageSrc: post.photos?.[0]?.src,
        chats: post.chats ?? post.chatCount ?? 0,
        likes: post.likes ?? 0,
        views: post.views ?? 0,
    }));
    const ownedProducts = products.filter(product => product.ownerId === ownerId).map(product => ({
        key: productVersion + ':' + product.id,
        title: product.title,
        price: product.price,
        directBuy: product.directBuy,
        neighborhood: product.neighborhood ?? '동네 정보 없음',
        ageLabel: product.ageLabel ?? '게시중',
        imageSrc: product.imageSrc,
        chats: product.chats ?? 0,
        likes: product.likes ?? 0,
        views: product.views ?? 0,
    }));
    return [...ownedPosts, ...ownedProducts];
}
