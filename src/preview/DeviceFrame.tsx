import { useEffect, useRef, useState, type ReactNode } from "react";
import "./DeviceFrame.css";

function StatusBar({ userName, onSwitchUser, onSwitchGuest, onResetDeals }: { userName: string; onSwitchUser: () => void; onSwitchGuest: () => void; onResetDeals: () => void }) {
    return (
        <div className="status-bar">
            {/* Hidden control: the clock resets every session sales record (2026-09-23). */}
            <button type="button" className="status-clock" onClick={onResetDeals} aria-label="판매·구매 기록 초기화" title="판매·구매 기록 초기화">9:41</button>
            <span className="status-bar-icons">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                    <rect x="10" y="3" width="3" height="9" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                <button type="button" className="status-battery status-wifi" onClick={onSwitchGuest} aria-label={`현재 사용자 ${userName}, 아무개 계정으로 전환`} title={`현재 사용자: ${userName}`}><svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
                    <path d="M8 11.2 5.9 8.9a3 3 0 0 1 4.2 0L8 11.2Zm4.2-4.5a7 7 0 0 0-8.4 0L2.2 5A9.2 9.2 0 0 1 13.8 5l-1.6 1.7ZM8 .8c3 0 5.8 1 8 2.9l-1.5 1.6A10 10 0 0 0 8 2.8 10 10 0 0 0 1.5 5.3L0 3.7A12.4 12.4 0 0 1 8 .8Z" />
                </svg></button>
                <button type="button" className="status-battery" onClick={onSwitchUser} aria-label={`현재 사용자 ${userName}, 사용자 전환`} title={`현재 사용자: ${userName}`}><svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
                    <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
                    <rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor" />
                    <path d="M24.5 4.3a2.6 2.6 0 0 1 0 4.4V4.3Z" fill="currentColor" opacity="0.4" />
                </svg>
            </button></span>
        </div>
    );
}

/** iPhone 16 Pro Max preview frame, centered in the viewport and scaled to fit. */
export function DeviceFrame({ version, onSwitchVersion, userName, onSwitchUser, onSwitchGuest, onResetDeals, children }: { version: "current" | "planned"; userName: string; onSwitchUser: () => void; onSwitchGuest: () => void; onResetDeals: () => void; onSwitchVersion: () => void; children: ReactNode }) {
    const [notice, setNotice] = useState<string | null>(null);
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 1800);
        return () => clearTimeout(timer);
    }, [notice]);
    const stageRef = useRef<HTMLDivElement>(null);
    const deviceRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.dataset.seedColorMode = "dark-only";
    }, []);

    useEffect(() => {
        const stage = stageRef.current;
        const device = deviceRef.current;
        const frame = frameRef.current;
        if (!stage || !device || !frame) return;
        // offsetWidth/Height ignore the transform, so this cannot feed back on itself.
        const fit = () => {
            const scale = Math.min(1, (stage.clientHeight - 48) / device.offsetHeight, (stage.clientWidth - 48) / device.offsetWidth);
            const style = getComputedStyle(device);
            const snap = (edge: number) => Math.round(edge * devicePixelRatio) / devicePixelRatio;
            device.style.setProperty("--device-scale", String(scale));
            device.style.setProperty("--device-left", `${snap((stage.clientWidth - device.offsetWidth * scale) / 2)}px`);
            device.style.setProperty("--device-top", `${snap((stage.clientHeight - device.offsetHeight * scale) / 2)}px`);

            const stageRect = stage.getBoundingClientRect();
            const deviceRect = device.getBoundingClientRect();
            frame.style.left = `${deviceRect.left - stageRect.left}px`;
            frame.style.top = `${deviceRect.top - stageRect.top}px`;
            frame.style.width = `${deviceRect.width}px`;
            frame.style.height = `${deviceRect.height}px`;
            frame.style.borderRadius = `${parseFloat(style.getPropertyValue("--device-radius")) * scale}px`;
        };
        const observer = new ResizeObserver(fit);
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="stage">
            {/* Usage guide in the empty stage area, for people trying the prototype without a walkthrough. Hidden on narrow viewports. */}
            <aside className="stage-guide" aria-label="프로토타입 사용법">
                <h2>프로토타입 사용법</h2>
                <p className="stage-guide-lead">화면 상단의 상태바 요소가 숨은 버튼이에요.</p>
                <dl>
                    <dt>다이나믹 아일랜드</dt><dd>현안 ↔ 신규 기획 전환 <span>신규일 때 연두 점</span></dd>
                    <dt>배터리</dt><dd>박경덕(서울, 판매자) ↔ 유주연(경상북도)</dd>
                    <dt>와이파이</dt><dd>아무개(서울) 계정으로 전환</dd>
                    <dt>시계</dt><dd>판매·구매 기록 초기화</dd>
                </dl>
                <h3>이렇게 따라 해 보세요</h3>
                <ol>
                    <li>다이나믹 아일랜드로 <b>신규 기획</b>으로 전환</li>
                    <li>도서 게시글을 열고 물품을 체크 → 하단에 합계</li>
                    <li><b>바로구매</b> → 배송지 → 결제</li>
                    <li>게시글로 돌아오면 산 물품이 <b>판매완료</b></li>
                    <li>배터리로 판매자 전환 → 나의 당근 → 판매관리 → <b>거래내역</b></li>
                    <li>채팅하기 → 상단 상태 칩 → 거래완료 → <b>후기 보내기</b></li>
                </ol>
                <ul className="stage-guide-notes">
                    <li>같은 시·도면 채팅하기, 다르면 질문하기가 떠요.</li>
                    <li>수수료·배송비·적립은 캡처를 재현한 값이에요.</li>
                    <li>기록은 이 브라우저에만 남아요.</li>
                </ul>
            </aside>
            <div className="device-stage" ref={stageRef}>
            <div className="device" ref={deviceRef}>
                <div className="device-screen" data-prototype-version={version}>
                    <div className="device-content">
                        <button type="button" className="dynamic-island" onClick={onSwitchVersion}
                            aria-label={version === "current" ? "현안 버전, 신규 기획 버전으로 전환" : "신규 기획 버전, 현안 버전으로 전환"}
                            aria-pressed={version === "planned"} title={version === "current" ? "현안 → 신규 기획" : "신규 기획 → 현안"} />
                        <StatusBar userName={userName} onSwitchUser={() => { onSwitchUser(); setNotice('switch'); }} onSwitchGuest={() => { onSwitchGuest(); setNotice('switch'); }} onResetDeals={() => { onResetDeals(); setNotice('판매·구매 기록을 초기화했어요.'); }} />
                        {notice && <div className="user-switch-notice" role="status">{notice === 'switch' ? `${userName}님으로 전환했어요.` : notice}</div>}
                        {children}
                    </div>
                </div>
            </div>
            <div className="device-frame" ref={frameRef} aria-hidden="true" />
            </div>
        </div>
    );
}
