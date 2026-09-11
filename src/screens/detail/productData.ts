import type { SellerId } from "../../data/sellers";
export type ProductId = "backbone" | "mimikyu";
export type SourceRegion = { source: string; x: number; y: number; width: number; height: number };
export type ProductCard = { title: string; price: string; photo: SourceRegion; reserved?: boolean; meta?: string };
export const region = (source: string, x: number, y: number, width = 199, height = 149): SourceRegion => ({ source: `/reference/detail/${source}.png`, x, y, width, height });
const card = (source: string, x: number, y: number, title: string, price: string, extra: Partial<ProductCard> = {}): ProductCard => ({ title, price, photo: region(source, x, y), ...extra });

export const backboneSimilar: ProductCard[] = [
    card("224029043",16,155,"풀박스) 아이폰 13 프로 256GB…","480,000원",{meta:"이웃광고 ⓘ"}),
    card("224029043",225,155,"아이패드 미니6 S급 풀박스","420,000원"),
    card("224029043",16,389,"[미개봉] 새상품 애플펜슬 USB-C…","95,000원"),
    card("224029043",225,389,"새상품급 아이패드 4세대 풀박스,…","150,000원"),
    card("224029043",16,609,"패드용 펜슬 화이트","5,000원"),
    card("224029043",225,609,"아이폰 17 블랙 256GB 풀박스","650,000원"),
    card("224029316",16,343,"애플 아이패드 실버","300,000원"),
    card("224029316",225,343,"아이패드 프로 키보드 케이스 12.9…","110,000원"),
    card("224029316",16,563,"아이폰xs 스마트배터리케이스","100,000원"),
    card("224029316",225,563,"✨ 아이패드 11세대 실버 단순개…","520,000원"),
    card("224029545",16,127,"아이폰 17 프로맥스 2TB 자급제…","260만원"),
    card("224029545",225,127,"[미개봉 자급제] 아이폰 17프로 51…","194만원"),
    card("224029545",16,346,"아이폰 정품 카드케이스 및 무선충…","110,000원"),
    card("224029545",225,346,"[미개봉 자급제]아이폰 17프로 51…","194만원"),
    card("224029545",16,566,"아이폰 8핀 보조배터리 2000mA…","5,000원"),
    card("224029545",225,566,"아이패드 스마트 폴리오 블랙","55,000원",{reserved:true}),
    card("224029790",16,123,"아이패드 핑크 케이스","나눔🧡",{reserved:true}),
    card("224029790",225,123,"(미개봉 새상품) 아이폰 11 케이스","300원"),
];
export const mimikyuSimilar: ProductCard[] = [
    card("224031543",16,430,"포켓몬스터 일러스트 예쁜 카드 모…","400원"),
    card("224031543",225,430,"포켓몬 2024 북미 할로윈팩","6,000원"),
    card("224031543",16,650,"포켓몬 카드 따라큐 일괄 등카","115,000원"),
    card("224031543",225,650,"포켓몬카드 팬텀&따라큐 GX 태그…","9,999원"),
    card("224031753",16,126,"귀여운 피카츄 포켓몬카드","75,000원"),
    card("224031753",225,126,"북미 포켓몬 따라큐 미미큐 할로윈…","18,000원"),
    card("224031753",16,345,"포켓몬카드 미미큐 2종 CGC, ag…","35,000원"),
    card("224031753",225,345,"포켓몬카드 따라큐 5장 스월 있어요","31,000원"),
    card("224031753",16,565,"포켓몬카드 일판 샤트 따라큐(미미…","70,000원"),
    card("224031753",225,565,"포켓몬카드 미미큐 홀로 CGC 10","45,000원"),
    card("224031999",16,116,"가오레 알로라 라이츄, 뮤츠, 따라큐","8,000원"),
    card("224031999",225,116,"포켓몬카드 25주년 피카츄","10,000원"),
    card("224031999",16,335,"포켓몬카드 따라큐 psa9","85,000원"),
    card("224031999",225,335,"포켓몬 따라큐 인형 25cm 정품","18,000원"),
    card("224031999",16,555,"포켓몬카드 따라큐 로켓단 홀로 일판","21,000원"),
    card("224031999",225,555,"포켓몬카드 따라큐 에너지 홀로 일판","7,000원"),
    card("224032251",16,116,"귀여운 라이츄 포켓몬카드","60,000원"),
    card("224032251",225,116,"포켓몬 태그스타 따라큐 스페셜","5,000원"),
    card("224032251",16,336,"[포켓몬스터] 따라큐 fit 콜렉션 봉…","28,000원"),
    card("224032251",225,336,"포켓몬 카드 피카츄&제크로무 GX…","70,000원"),
];
function squareAd(source: string, x: number, y: number, title: string, price: string, meta = "쿠팡"): ProductCard {
    return { title, price, meta, photo: region(source,x,y,128,128) };
}
const backboneAds = [
    squareAd("224030014",16,326,"포팩트 AX01 Lite 모바일 게임패드 컨트…","59,000원"),
    squareAd("224030014",155,326,"EasySMX X05 Pro 게임패드 컨트롤러 무…","52,800원"),
    squareAd("224030014",294,326,"공식수입 백본 원 Backbone One 2세…","139,000원"),
    squareAd("224030014",16,557,"EasySMX X05 게임패드 무선 컨트롤…","42,800원"),
    squareAd("224030014",155,557,"Machenike 메카닉 G5 Pro Max SE 무선 컨…","59,800원"),
    squareAd("224030014",294,557,"Machenike 메카닉 G5 Pro V2 무선 광학 컨…","86,800원"),
];
const mimikyuAds = [
    squareAd("224033240",16,326,"포켓몬스터 따라큐 피규어 귀여운 포켓몬…","15,900원","송이네상점"),
    squareAd("224033240",155,326,"포켓몬스터 따라큐 포케피스 봉제인형 -…","63,720원"),
    squareAd("224033240",294,326,"[일본 정품] 타카라토미아츠 포켓몬…","39,660원"),
    squareAd("224033240",16,557,"6종세트) 포켓몬스터 오발티크 컬렉션 가디…","83,390원"),
    squareAd("224033240",155,557,"포켓몬 센터 후와후와 폭신 안아줘 따라큐 미…","66,730원"),
    squareAd("224033240",294,557,"리멘트 포켓몬 스윙비네트 컬렉션 1탄…","24,400원"),
];
const mimikyuTopAds: ProductCard[] = [
    {title:"포켓몬 센터 포켓피스 터치 무…",price:"39,500원",meta:"쿠팡",photo:region("224031543",16,160,108,108)},
    {title:"포켓몬스터 캡슐 빛나요 포켓몬 컬…",price:"33,490원",meta:"쿠팡",photo:region("224031543",134,160,108,108)},
    {title:"리멘트 포켓몬 스윙비네트 컬렉션…",price:"24,400원",meta:"쿠팡",photo:region("224031543",252,160,108,108)},
    mimikyuAds[1],
];
export const productDetails = {
    backbone: {
        sellerId: "raum" as SellerId, directBuy: false,
        title:"(미개봉백본원 아이폰 게임패드 블랙", price:"50,000원", temperature:"36.8°C", mood:"🙂", category:"디지털기기", updated:"끌올 1주 전", likes:2, views:31, initiallyLiked:true,
        // The screenshot says 1/2, but the second photo was not supplied.
        photos:[region("224026836",0,0,440,440)], photoTotal:2,
        description:["아이폰과 함께 사용하는 백본원 게임패드에요\nUSB-C 타입으로 연결하여 사용하며, 게임을 더욱 실감나게 즐길 수 있어요\n박스 구성품 그대로 보관되어 있어 선물용으로도 좋아요"],
        similar:backboneSimilar, topAds:backboneAds.slice(0,4), bottomAds:backboneAds,
        sellerItems:[card("224029790",16,506,"댄 브라운 비밀의 비밀 1, 2권","8,000원")], keyword:"아이폰 게임패드",
    },
    mimikyu: {
        sellerId: "dudu" as SellerId, directBuy: true,
        title:"아주 귀한 따라큐",price:"31,000원",temperature:"41.8°C",mood:"😚",category:"취미/게임/음반",updated:"끌올 1일 전",likes:10,views:628,initiallyLiked:false,
        // Supplied photos are 1/5 through 4/5. No substitute is invented for 5/5.
        photos:["224030274","224030489","224030688","224030922"].map(source=>region(source,0,0,440,440)),photoTotal:5,
        description:["사진 속 카드는 포켓몬 카드 게임 썬&문 확장팩 <태그올스타즈 (SM12a)>에 수록된 따라큐(063/173) 한글판 카드입니다", "귀여운 포켓몬 따라큐 카드에요. 소장 가치가 있는 카드로, 포켓몬을 좋아하는 분들에게 좋은 아이템이 될 거예요. 포켓몬 카드 수집을 시작하는 분들에게도 좋은 선택이 될 것 같아요.", "홀로다 보니 앞면 써페이스에 미세 스크레치는 있습니다"],
        similar:mimikyuSimilar,topAds:mimikyuTopAds,bottomAds:mimikyuAds,
        sellerItems:[
            card("224032476",16,146,"포켓몬카드 25주년 피카츄 뚱카츄…","32,000원"),
            card("224032476",225,146,"포켓몬카드 25주년 피카츄 뚱카츄…","32,000원"),
            card("224032476",16,366,"상태 완벽 정글 피카츄 북미 포켓…","9,000원"),
            card("224032476",225,366,"상태 완벽 정글 피카츄 북미 포켓…","9,000원"),
        ],keyword:"따라큐",
    },
} satisfies Record<ProductId, unknown>;
export function isProductId(value: string): value is ProductId { return value === "backbone" || value === "mimikyu"; }
