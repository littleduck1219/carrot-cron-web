import { publicAsset } from '../../data/publicAsset';
import type { ProductCard, SourceRegion } from './productData';

const photo = (source: string, x: number, y: number, width = 199, height = 149): SourceRegion => ({ source: publicAsset(`reference/switch-games/${source}.jpg`), x, y, width, height });
const card = (source: string, x: number, y: number, title: string, price: string, width = 199, height = 149, meta?: string): ProductCard => ({ title, price, meta, photo: photo(source, x, y, width, height) });

export const gamePostRecommendations = {
    topAds: [
        card('6', 16, 153, '닌텐도 스위치 충전교단 Nintendo…', '64,500원', 108, 108, '쿠팡'),
        card('6', 134, 153, '닌텐도 스위치 OU 일본발매', '58,500원', 108, 108, '쿠팡'),
        card('6', 252, 153, '닌텐도 스위치 젤다의 전설 지혜의…', '36,630원', 108, 108, '쿠팡'),
        card('6', 367, 153, '베가스 파티 닌텐도스위치', '81,100원', 108, 108, '쿠팡'),
    ],
    similar: [
        card('6', 16, 423, '닌텐도 스위치 산나비 포켓몬 젤다…', '18,000원'),
        card('6', 225, 423, '닌텐도 스위치 게임 타이틀 모음', '40,000원'),
        card('6', 16, 642, '닌텐도 스위치 게임 칩 판매합니다', '1,000원'),
        card('6', 225, 642, '닌텐도 스위치 게임칩 7종 게임타…', '1원'),
        card('7', 16, 343, '닌텐도 스위치 게임 타이틀 다수', '50,000원'),
        card('7', 225, 343, '닌텐도 스위치 타이틀 모음', '20,000원'),
        card('7', 16, 562, '닌텐도 스위치 게임칩 다수 판매', '25,000원'),
        card('7', 225, 562, '닌텐도 스위치 게임칩 판매', '38,000원'),
        card('8', 16, 119, '닌텐도 스위치 게임 5종', '40,000원'),
        card('8', 225, 119, '닌텐도 스위치 칩', '20,000원'),
        card('8', 16, 339, '닌텐도스위치게임칩 팝니다', '40,000원'),
        card('8', 225, 339, '닌텐도 스위치 젤다의 전설 야생의…', '50,000원'),
    ],
    keyword: '닌텐도 스위치 게임 타이틀',
    sellerItems: [
        card('9', 16, 282, '닌텐도 스위치 OLED 화이트 풀박스', '245,000원'),
        card('9', 225, 282, '닌텐도 스위치 젤다의 전설…', '80,000원'),
        card('9', 16, 505, '닌텐도 oled 독 블랙/화이트', '25,000원'),
        card('9', 225, 505, '닌텐도 스위치 풀박스', '170,000원'),
    ],
    bottomAds: [
        card('10', 16, 325, '닌텐도 스위치 암색의 마주 일본발매 한정판', '129,000원', 128, 128, '쿠팡'),
        card('10', 155, 325, '닌텐도 스위치 Mario Luigi Brothership', '116,300원', 128, 128, '쿠팡'),
        card('10', 294, 325, '닌텐도 스위치 충전교단 Nintendo Switch', '64,500원', 128, 128, '쿠팡'),
        card('10', 16, 557, '베가스 파티 닌텐도스위치 카지노', '81,100원', 128, 128, '쿠팡'),
        card('10', 155, 557, '데몬 스로틀 닌텐도스위치 복수 밤', '70,400원', 128, 128, '쿠팡'),
        card('10', 294, 557, '닌텐도 스위치 나비의 독 꽃의 쇠사슬', '68,460원', 128, 128, '쿠팡'),
    ],
};
