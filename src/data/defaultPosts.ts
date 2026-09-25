import { publicAsset } from './publicAsset';
import type { PublishedPost } from './publishedPosts';
import posts from './defaultPosts.json';

export const defaultPosts = (posts as PublishedPost[]).map(post => ({
    ...post,
    photos: post.photos.map(photo => ({ ...photo, src: publicAsset(photo.src.replace(/^\//, '')) })),
    mapPhoto: post.mapPhoto ? publicAsset(post.mapPhoto.replace(/^\//, '')) : undefined,
}));

// Built-in sample posts can be deleted from 판매관리; the hidden ids persist in localStorage until the status-bar clock reset (2026-09-25).
const HIDDEN = 're-carrot.hidden-builtins.v1';
export const hiddenBuiltIns = (): string[] => { try { return JSON.parse(localStorage.getItem(HIDDEN) ?? '[]'); } catch { return []; } };
export const hideBuiltIn = (id: string) => { try { localStorage.setItem(HIDDEN, JSON.stringify([...new Set([...hiddenBuiltIns(), id])])); } catch { /* in-memory state still hides it this session */ } };
export const restoreBuiltIns = () => { try { localStorage.removeItem(HIDDEN); } catch { /* nothing to clear */ } };
export const visibleDefaultPosts = () => { const hidden = hiddenBuiltIns(); return defaultPosts.filter(post => !hidden.includes(post.id)); };
