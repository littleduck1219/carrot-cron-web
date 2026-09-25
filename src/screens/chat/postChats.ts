export type ChatMessage = { mine: boolean; text: string; time: string; read?: boolean };

/** Sample conversations for specific built-in posts (buyer's side is "mine"). Other posts use the generic exchange in ChatRoom. */
export const postChats: Record<string, ChatMessage[]> = {
    // SNS에서 핫한 도서 13권: the buyer checks whether two specific books are still available (2026-09-25 user request).
    'default-sns-books-planned': [
        { mine: true, text: '안녕하세요. 회색인간이랑 당신을 아름답게 하는 것들 아직 있을까요?', time: '오전 9:51' },
        { mine: false, text: '네, 두 권 다 아직 있어요', time: '오전 10:04' },
        { mine: true, text: '상태는 어떤가요? 밑줄이나 접힌 부분 있을까요?', time: '오전 10:14' },
        { mine: false, text: '둘 다 한 번 읽고 보관해서 깨끗해요. 밑줄은 없습니다', time: '오전 10:18' },
        { mine: true, text: '그럼 두 권 같이 살게요. 직거래 가능할까요?', time: '오후 4:17', read: true },
    ],
};
postChats['default-sns-books-current'] = postChats['default-sns-books-planned'];
