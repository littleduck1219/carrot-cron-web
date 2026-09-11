import type { SellerId } from "../../data/sellers";
export interface HomeItem {
    sellerId?: SellerId;
    id: string;
    title: string;
    meta: string;
    price?: string;
    imageAlt: string;
    imageY: number;
    imageSource?: string;
    imageHeight?: number;
    imageVisibleHeight?: number;
    likes?: number;
    chats?: number;
    directBuy?: boolean;
    reserved?: boolean;
    adAction?: string;
}

/** Fixed observations from user-provided mobile screenshots, displayed at 440 × 956.
 * Partial rows retain only readable text and unobscured photo regions.
 * New captures follow the original list, with the 10:21 capture before the 10:22 captures.
 * Capture boundaries do not establish continuity of the original app's feed.
 */
const capture1 = "/reference/home-feed-20260911-1.png"; // 222308314
const capture2 = "/reference/home-feed-20260911-2.png"; // 222308732
const capture3 = "/reference/home-feed-20260911-3.png"; // 222308966
const capture4 = "/reference/home-feed-20260911-4.png"; // 222309207

export const homeItems: HomeItem[] = [
    { id: "backbone", sellerId: "raum", title: "(미개봉백본원 아이폰 게임패드 블랙", meta: "800m · 1주 전", price: "50,000원", imageAlt: "백본원 게임패드 포장 상자", imageY: 188, likes: 2 },
    { id: "mimikyu", sellerId: "dudu", title: "아주 귀한 따라큐", meta: "7시간 전", price: "31,000원", imageAlt: "따라큐 포켓몬 카드", imageY: 349, likes: 5, directBuy: true },
    { id: "fuji", title: "Fuji x-t50, XF 16-50mm F2.8-4.8 R LM WR 팝니다", meta: "금천구 독산동 · 이웃광고", price: "208만원", imageAlt: "후지필름 카메라와 렌즈", imageY: 510, likes: 2 },
    { id: "sony", title: "소니 a7m5 - a7m4,a7c2,a7cr 교환 원해요!", meta: "경기 고양시 · 28km · 2일 전", price: "200,000원", imageAlt: "소니 카메라와 포장 상자", imageY: 671, likes: 17, chats: 4, directBuy: true },
    { id: "local-ad", title: "서초동/ 목만 50분 풀어드립…", meta: "", price: "39,800원", imageAlt: "캡처 하단에 일부 보이는 동네 광고 사진", imageY: 839, imageVisibleHeight: 34 },

    // 222309207: 10:21, header visible. The final row is obscured by navigation.
    { id: "ryzen-keycap", title: "라이젠 ESC 키캡", meta: "5일 전", price: "3,000원", imageAlt: "라이젠 로고 키캡 상자", imageSource: capture4, imageY: 196, likes: 1, directBuy: true },
    { id: "standard-compass", title: "옛날 STANDARD 정밀 제도기 컴퍼스 풀세트 + 제도기 세트 서비스", meta: "중앙동 · 1km · 1일 전", price: "10,000원", imageAlt: "파란 케이스의 제도기 컴퍼스 세트", imageSource: capture4, imageY: 357, chats: 1, reserved: true },
    { id: "stationery-sale", title: "문구점 폐업 2차", meta: "봉천동 · 900m · 8시간 전", price: "1,000원", imageAlt: "여러 종류의 포장된 문구용품", imageSource: capture4, imageY: 518, chats: 6, likes: 23 },
    { id: "azit-studio-ad", title: "사장님이 미쳤어요 ㄷㄷ 극 가성비 서울대 합주실", meta: "아지트 합주실 · 광고", price: "10,000원", imageAlt: "키보드와 앰프가 있는 합주실", imageSource: capture4, imageY: 679, adAction: "바로가기" },
    { id: "backbone-pro", title: "백본 프로 게임 컨트롤러 풀박스 미개봉", meta: "", imageAlt: "캡처에 일부 보이는 백본 프로 포장 상자", imageSource: capture4, imageY: 839, imageVisibleHeight: 33 },

    // 222308314: top product name and bottom ESP32 details are cropped.
    { id: "space-black-laptop", title: "… 2tb 스페이스블랙", meta: "서초구 서초3동 · 이웃광고", price: "690만원", imageAlt: "상단이 잘린 스페이스블랙 노트북 포장 사진", imageSource: capture1, imageY: 62, imageVisibleHeight: 114, likes: 10 },
    { id: "lego-doom", title: "레고 마블 닥터 둠 흉상 벌크 76345", meta: "강남 삼성동 · 9km · 1일 전", price: "40,000원", imageAlt: "레고 마블 닥터 둠 흉상 상자", imageSource: capture1, imageY: 210, chats: 1, likes: 5, reserved: true },
    { id: "canon-ad", title: "9월 놓칠 수 없는 구매찬스! 캐논 역대급 혜택", meta: "캐논코리아 · 광고", imageAlt: "캐논 카메라 두 대가 나오는 광고", imageSource: capture1, imageY: 371, adAction: "바로가기" },
    { id: "hynix-t31", title: "SK하이닉스 T31 1TB 외장 SSD USB 스틱", meta: "행운동 · 100m · 1일 전", price: "240,000원", imageAlt: "SK하이닉스 USB 외장 SSD", imageSource: capture1, imageY: 532, chats: 3, likes: 6 },
    { id: "nord-pedal", title: "Nord stage 피아노 싱글 페달 SP1", meta: "2일 전", price: "65,000원", imageAlt: "Nord 싱글 페달 포장 상자", imageSource: capture1, imageY: 693, directBuy: true },
    { id: "esp32-chip", title: "ESP32 WROMM 칩", meta: "", imageAlt: "캡처 하단에 일부 보이는 ESP32 칩 사진", imageSource: capture1, imageY: 853, imageVisibleHeight: 20 },

    // 222308732: the unidentifiable top row is not duplicated as an invented listing.
    { id: "bodycare-video-ad", title: "몸도 피곤한데, 머리까지 무거운날 첫방문 30% 할인", meta: "더바디케어 · 광고", imageAlt: "Head Spa, Body Care, Foot Care 장면과 00:32 길이가 표시된 광고", imageSource: capture2, imageY: 150, imageHeight: 192, adAction: "영상 더보기" },
    { id: "arkham-cards", title: "아컴호러 카드게임 (아딱) 돌아온 시리즈 일괄판매", meta: "경기 군포시 · 14km · 4일 전", price: "750,000원", imageAlt: "아컴호러 카드게임 상자 여러 개", imageSource: capture2, imageY: 376, chats: 1, likes: 8, reserved: true },
    { id: "moleskine-book", title: "몰폰북", meta: "서울 성북구 · 12km · 15시간 전", price: "5,000원", imageAlt: "풍경과 영문 문구가 인쇄된 몰폰북", imageSource: capture2, imageY: 536, likes: 1, directBuy: true },
    { id: "tomato-glasses", title: "정품 토마토 안경 외 선글라스", meta: "동작 상도1동 · 3km · 6시간 전", price: "10,000원", imageAlt: "안경 두 개와 선글라스", imageSource: capture2, imageY: 697, directBuy: true },
    { id: "fursuit", title: "퍼슈트 일괄 판매합니다 (덤 있음)", meta: "", imageAlt: "캡처에 일부 보이는 퍼슈트 사진", imageSource: capture2, imageY: 858, imageVisibleHeight: 14 },

    // 222308966: the first and last fragments lack enough readable listing information.
    { id: "daybreak-earphones", title: "인이어 daybreak 이어폰 단순개봉 새상품", meta: "3시간 전", price: "170,000원", imageAlt: "상자 안에 들어 있는 daybreak 이어폰 케이스", imageSource: capture3, imageY: 132, likes: 2, directBuy: true },
    { id: "kangaroo-rug", title: "천연 캥거루 가죽 러그", meta: "영등포 신길동 · 5km · 1시간 전", price: "69,000원", imageAlt: "바닥에 펼친 갈색 가죽 러그", imageSource: capture3, imageY: 301, likes: 20, directBuy: true },
    { id: "silver-bar", title: "실버바 1kg 포나인 대성금속", meta: "서초구 방배동 · 이웃광고", price: "306만원", imageAlt: "실버바와 포장 상자", imageSource: capture3, imageY: 462, chats: 5, likes: 29 },
    { id: "gemini-pass", title: "구글 Gemini Pro AI 18개월 이용권", meta: "봉천동 · 2km · 1일 전", price: "20,000원", imageAlt: "흰 배경의 Gemini 로고", imageSource: capture3, imageY: 623, chats: 3, likes: 3 },
    { id: "goblin-game-ad", title: "차원이 다른 코스튬 👕 무료나눔 받으실분", meta: "도깨비의세계 · 광고", imageAlt: "캡처에 일부 보이는 도깨비의세계 게임 캐릭터 광고", imageSource: capture3, imageY: 784, imageVisibleHeight: 88 },
];
