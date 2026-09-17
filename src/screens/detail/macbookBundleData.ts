import type { ProductCard, ProductDetailData, SourceRegion } from "./productData";

// Original attachments are 589 × 1280; the shared renderer uses 440px coordinates.
const scale = 440 / 589;
const photo = (page: number, x: number, y: number, width = 267, height = 200): SourceRegion => ({
    source: `/reference/macbook-bundle/${String(page).padStart(2, "0")}.${page >= 9 ? "png" : "jpg"}`,
    x: x * scale, y: y * scale, width: width * scale, height: height * scale,
});
const card = (page: number, x: number, y: number, title: string, price: string, extra: Partial<ProductCard> = {}): ProductCard => ({
    title, price, photo: photo(page, x, y), ...extra,
});

export const macbookBundle: ProductDetailData = {
    sellerId: "forapple", directBuy: true,
    title: "[일괄판매/개별가능] 마지막 맥북프로 M5 Pro 미개봉 , iPad Pro, Dell U3225QE 모니터",
    price: "650,000원", extraCost: "18,300원", temperature: "45.8°C", mood: "😚",
    category: "기타 중고물품", updated: "끌올 21시간 전", chats: 1, likes: 45, views: 10844, initiallyLiked: false,
    // The dots belong to the photographed Apple page, not a verified app photo count.
    photos: [photo(2, 0, 0, 589, 589)], photoTotal: 1,
    description: [
        "[일괄판매/개별가능] 맥북프로 M5 Pro 미개봉 3대 + iPad Pro + Dell 모니터",
        "개발용으로 구매했는데 사용할 일이 없어져서 정리합니다.\n전부 정품 미개봉 새 제품이며, 개별 구매도 가능합니다.",
        "—",
        "💻 맥북프로 16 M5 Pro (1개) — 미개봉\n색상: 스페이스그레이\n화면: 16.2형\nCPU: 18코어 / GPU: 20코어\nRAM: 24GB / SSD: 1TB\n✅ 애플케어플러스 신규 가입 가능\n💰 판매가격 430만원 (개당)",
        "—",
        "💻 맥북프로 14 M5 Pro (1개) — 390만원\n색상: 실버\n화면: 14.2형\nCPU: 15코어 / GPU: 16코어\nRAM: 24GB / SSD: 1TB\n✅ 애플케어플러스 신규 가입 가능",
        "—",
        "📱 iPad Pro 13 (1개) — 미개봉\n색상: 스페이스블랙\n스탠다드 글래스 · Wi-Fi+Cellular\n저장용량: 256GB\n✅ 애플케어플러스 신규 가입 가능\n💰 판매가격 230만원",
        "🖥️ Dell U3225QE 모니터 — 판매완료\n화면: 32형 (4K UHD)\nUSB-C 허브 탑재\n구성: 본품 + 케이블 (박스 없음)\n제조사 보증: 2028년 5월까지",
        "—",
        "✅ 전부 정품, 박스/구성품 완전 (모니터 박스 제외)\n✅ 일괄 구매 시 가격 조정 가능\n✅ 직거래 우선 / 택배 가능\n✅ 전 품목 카드결제 가능",
    ],
    topAds: [
        { title: "애플 맥북 프로 16형 코어i7 램16G SS…", price: "690,000원", discount: "42%", oldPrice: "149만원", meta: "Re:think", photo: photo(6, 21, 190, 145, 145) },
        { title: "2026 맥북 에어 15 M5 A3448 케이…", price: "46,317원", meta: "temu", photo: photo(6, 179, 190, 145, 145) },
        { title: "맥북 프로 에어 14 15 16 m1 m2 m3…", price: "30,400원", discount: "20%", oldPrice: "38,000원", meta: "엘라고", photo: photo(6, 337, 190, 145, 145) },
    ],
    similar: [
        card(6, 21, 575, "빠른 판매 희망‼️ 맥북프로 M1 1…", "150만원"),
        card(6, 301, 575, "케이스티파이 케이스", "38,000원"),
        card(6, 21, 869, "✨ 맥북 네오 A18 Pro / 512GB…", "990,000원"),
        card(6, 301, 869, "100달러 판매합니다(고액권) _ 오…", "146,500원"),
        card(7, 21, 229, "버즈4 프로 미개봉", "280,000원"),
        card(7, 301, 229, "(급처)맥북 프로 16인치 M1 Pro/…", "157만 7,000원"),
        card(7, 21, 523, "2019 맥북프로 16인치", "420,000원"),
        card(7, 301, 523, "M2 pro 맥북프로 16인치 16gb 1…", "170만원"),
        card(7, 21, 817, "[램 32g, NVMe SSD] MSI Pre…", "700,000원"),
        card(7, 301, 817, "갤럭시 Z플립7 코랄레드 2…", "680,000원", { reserved: true }),
        card(8, 21, 239, "2019 맥북프로 16인치", "450,000원"),
        card(8, 301, 239, "갤럭시 Z 플립7 256GB 제트블랙", "650,000원"),
        card(8, 21, 532, "2019년식 맥북프로 15인…", "350,000원", { reserved: true }),
        card(8, 301, 532, "[자급제]갤럭시 Z 폴드6 5…", "610,000원", { reserved: true }),
        card(8, 21, 827, "갤럭시Z플립6 / 256기가", "230,000원", { reserved: true }),
        card(8, 301, 827, "2019 맥북프로 16인치 기…", "450,000원", { reserved: true }),
        card(9, 21, 142, "아이폰 15 프로 128GB 애플케어…", "750,000원", { photo: photo(9, 21, 142, 267, 171) }),
        card(9, 301, 142, "아이패드프로11 정품매직…", "240,000원", { reserved: true, photo: photo(9, 301, 142, 267, 171) }),
        card(9, 21, 407, "아이폰 17 프로 맥스 2TB 박스및…", "270만원"),
        card(9, 301, 407, "아이폰17 프로 실버 256GB 자급…", "159만원"),
    ],
    sellerItems: [
        card(10, 21, 239, "아이패드 프로 13인치 M5 스페이…", "250만원"),
        card(10, 301, 239, "아이패드 프로 13인치 M5 스페이…", "250만원"),
        card(10, 21, 532, "[일괄판매/개별가능] 마지막 맥북…", "650,000원"),
        card(10, 301, 532, "맥북프로 16 M5 Pro 미개봉 CP…", "430만원"),
    ],
    // The footer obscures prices in the last capture; do not invent them.
    bottomAds: [
        { title: "Apple 맥북 프로 16 M5 Max Z1N20003H 1…", photo: photo(10, 21, 906, 173, 173) },
        { title: "Apple 맥북 프로 16 M5 칩 스페이스 블랙 M5…", photo: photo(10, 208, 906, 173, 173) },
        { title: "Apple 맥북 프로 14 M5 칩 스페이스 블랙 M5…", photo: photo(10, 394, 906, 173, 173) },
    ],
    keyword: "맥북프로m5pro",
};
