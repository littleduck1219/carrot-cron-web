import { FeedIcon } from "../home/FeedIcon";
import "./account.css";

const services = ["중고거래", "스토리", "알바", "스토어", "동네걷기", "세탁 수거", "당근이네", "전체보기"];
const activity = ["알바 지원내역", "선생님 프로필 관리", "내 커뮤니티 글", "후기 및 제안한 장소"];
const settings = ["내 동네 설정", "동네 인증하기", "QR 코드 스캔", "앱 설정"];

export function MyCarrotScreen({ userName, temperature, onHome, onOpenSales }: { userName: string; temperature: string; onHome: () => void; onOpenSales: () => void }) {
    return <div className="account-screen">
        <header className="account-header"><h1>나의 당근</h1><button type="button" aria-label="설정" disabled>⚙</button></header>
        <main className="account-scroll">
            <section className="account-profile"><span className="account-avatar"><FeedIcon name="person" /></span><strong>{userName}</strong><small>{temperature}</small><span className="account-chevron">›</span></section>
            <section className="account-pay"><div><b><span>●</span>pay</b><button disabled>충전</button><button disabled>송금</button><button disabled>결제</button></div><p><span>머니 <b>54원</b> ›</span><span>포인트 <b>15p</b> ›</span></p></section>
            <section className="account-services">{services.map((service, index) => <button key={service} disabled><span>{["🛍", "▶", "Q", "🛒", "👟", "👕", "🥕", "›"][index]}</span>{service}</button>)}</section>
            <section className="account-card account-quick"><h2>자주 사용</h2><button type="button" onClick={onOpenSales}><span>▧</span>판매관리<i>›</i></button><button disabled><span>✣</span>내 물건 가격 찾기<i>›</i></button></section>
            <section className="account-card"><h2>나의 거래</h2><button type="button" onClick={onOpenSales}><span>▧</span>판매관리<i>›</i></button><button disabled><span>▱</span>구매내역<i>›</i></button><button disabled><span />내 물건 가격 찾기</button><button disabled><span />중고거래 가계부</button></section>
            <section className="account-card"><h2>나의 관심</h2><button disabled><span>♡</span>관심목록<i>›</i></button><button disabled><span>◇</span>키워드 알림 설정<i>›</i></button><button disabled><span>▱</span>내 단골 목록<i>›</i></button></section>
            <section className="account-card"><h2>나의 활동</h2>{activity.map(item => <button key={item} disabled><span>○</span>{item}<i>›</i></button>)}</section>
            <section className="account-card"><h2>설정</h2>{settings.map(item => <button key={item} disabled><span>◉</span>{item}<i>›</i></button>)}</section>
        </main>
        <nav className="feed-navigation account-navigation" aria-label="하단 내비게이션">
            <button type="button" className="feed-nav-item" onClick={onHome}><FeedIcon name="home" /><span>홈</span></button>
            <button type="button" className="feed-nav-item" disabled><FeedIcon name="community" /><span>커뮤니티</span></button>
            <button type="button" className="feed-nav-item" disabled><FeedIcon name="map" /><span>동네지도</span></button>
            <button type="button" className="feed-nav-item" disabled><FeedIcon name="chat" /><span>채팅</span></button>
            <button type="button" className="feed-nav-item" aria-current="page"><FeedIcon name="person" /><span>나의 당근</span></button>
        </nav>
    </div>;
}
