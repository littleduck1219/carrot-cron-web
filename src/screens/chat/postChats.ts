export type ChatMessage = { mine: boolean; text: string; time: string; read?: boolean };

/** Sample conversations for specific built-in posts (buyer's side is "mine"). Other posts use the generic exchange in ChatRoom. */
export const postChats: Record<string, ChatMessage[]> = {
    // SNS에서 핫한 도서 13권: two books were already sold but the post is not updated yet (2026-09-25 user request) — the case the per-item status solves.
    'default-sns-books-planned': [
        { mine: true, text: '안녕하세요. 회색인간이랑 당신을 아름답게 하는 것들 아직 있을까요?', time: '오전 9:51' },
        { mine: false, text: '아 죄송해요, 그 두 권은 어제 다른 분께 나갔어요. 게시글을 아직 못 고쳤네요', time: '오전 10:04' },
        { mine: true, text: '아쉽네요. 그럼 가시고기는 아직 있나요?', time: '오전 10:14' },
        { mine: false, text: '가시고기는 있어요. 팔린 책들은 오늘 중으로 게시글에서 정리해 둘게요', time: '오전 10:18' },
        { mine: true, text: '그럼 가시고기 한 권 살게요. 직거래 가능할까요?', time: '오후 4:17', read: true },
    ],
};
postChats['default-sns-books-current'] = postChats['default-sns-books-planned'];
