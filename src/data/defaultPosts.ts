import { publicAsset } from './publicAsset';
import type { PublishedPost } from './publishedPosts';
import posts from './defaultPosts.json';

export const defaultPosts = (posts as PublishedPost[]).map(post => ({
    ...post,
    photos: post.photos.map(photo => ({ ...photo, src: publicAsset(photo.src.replace(/^\//, '')) })),
    mapPhoto: post.mapPhoto ? publicAsset(post.mapPhoto.replace(/^\//, '')) : undefined,
}));
