export type FeedIconName = "pin" | "search" | "bell" | "menu" | "more" | "heart" | "shopping" | "plus" | "home" | "community" | "map" | "chat" | "person";

export function FeedIcon({ name }: { name: FeedIconName }) {
    const paths = {
        pin: <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="currentColor" fillRule="evenodd" stroke="none" />,
        search: <><circle cx="10.5" cy="10.5" r="8" /><path d="m16.5 16.5 5 5" /></>,
        bell: <><path d="M5 16c1-3 1-4 1-8a6 6 0 0 1 12 0c0 4 0 5 1 8-4 2-10 2-14 0Z" /><path d="M9 20c1 3 5 3 6 0" /></>,
        menu: <path d="M3 4h18M3 12h18M3 20h18" />,
        more: <g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></g>,
        heart: <path d="M12 21C7 17 1.5 13 1.5 7.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 10.5 2.5C22.5 13 17 17 12 21Z" fill="currentColor" stroke="none" />,
        shopping: <><path d="m3 9 16-3 3 14-16 3Z" fill="currentColor" stroke="none" /><path d="M8 8V5a4 4 0 0 1 8 0v3" /><path d="m7 15 3 2 5-6" stroke="#35251e" /></>,
        plus: <path d="M12 3v18M3 12h18" />,
        home: <path d="M2 10a3 3 0 0 1 1-2L10 3a3 3 0 0 1 4 0l7 5a3 3 0 0 1 1 2v11a2 2 0 0 1-2 2h-5v-8a3 3 0 0 0-6 0v8H4a2 2 0 0 1-2-2Z" fill="currentColor" stroke="none" />,
        community: <><circle cx="12" cy="6" r="2.5" /><circle cx="4" cy="3" r="2" /><circle cx="20" cy="3" r="2" /><path d="M7 21v-5a5 5 0 0 1 10 0v5H7ZM4 10c-3 0-3 4-3 7h3M20 10c3 0 3 4 3 7h-3M3 7l2 1M21 7l-2 1" /></>,
        map: <><path d="M12 23S3 16 3 10a9 9 0 0 1 18 0c0 6-9 13-9 13Z" /><circle cx="12" cy="10" r="4.5" /></>,
        chat: <><path d="M12 2a10 10 0 0 0-8 16l-2 4 6-1a10 10 0 1 0 4-19Z" /><g fill="currentColor" stroke="none"><circle cx="7" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="17" cy="12" r="1" /></g></>,
        person: <><circle cx="12" cy="6" r="5" /><path d="M2 23c0-11 20-11 20 0H2Z" /></>,
    };
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
