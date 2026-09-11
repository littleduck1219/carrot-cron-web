import { useEffect, useRef, useState, type ReactNode } from "react";
import "./DeviceFrame.css";

type ColorMode = "system" | "light-only" | "dark-only";

const MODES: { value: ColorMode; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light-only", label: "Light" },
    { value: "dark-only", label: "Dark" },
];

function StatusBar() {
    return (
        <div className="status-bar">
            <span>9:41</span>
            <span className="status-bar-icons">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                    <rect x="10" y="3" width="3" height="9" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
                    <path d="M8 11.2 5.9 8.9a3 3 0 0 1 4.2 0L8 11.2Zm4.2-4.5a7 7 0 0 0-8.4 0L2.2 5A9.2 9.2 0 0 1 13.8 5l-1.6 1.7ZM8 .8c3 0 5.8 1 8 2.9l-1.5 1.6A10 10 0 0 0 8 2.8 10 10 0 0 0 1.5 5.3L0 3.7A12.4 12.4 0 0 1 8 .8Z" />
                </svg>
                <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
                    <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
                    <rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor" />
                    <path d="M24.5 4.3a2.6 2.6 0 0 1 0 4.4V4.3Z" fill="currentColor" opacity="0.4" />
                </svg>
            </span>
        </div>
    );
}

/** iPhone 16 Pro Max preview frame, centered in the viewport and scaled to fit. */
export function DeviceFrame({ children, controls }: { children: ReactNode; controls?: ReactNode }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const deviceRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<ColorMode>("dark-only");

    useEffect(() => {
        document.documentElement.dataset.seedColorMode = mode;
    }, [mode]);

    useEffect(() => {
        const stage = stageRef.current;
        const device = deviceRef.current;
        if (!stage || !device) return;
        // offsetWidth/Height ignore the transform, so this cannot feed back on itself.
        const fit = () => {
            device.style.setProperty(
                "--device-scale",
                String(
                    Math.min(
                        1,
                        (stage.clientHeight - 48) / device.offsetHeight,
                        (stage.clientWidth - 48) / device.offsetWidth,
                    ),
                ),
            );
        };
        const observer = new ResizeObserver(fit);
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="stage">
            <div className="stage-controls">
                {controls}
            <div className="stage-toolbar">
                {MODES.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={mode === value}
                        onClick={() => setMode(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            </div>
            <div className="device-stage" ref={stageRef}>
            <div className="device" ref={deviceRef}>
                <div className="device-screen">
                    <div className="dynamic-island" />
                    <StatusBar />
                    {children}
                    <div className="home-indicator" />
                </div>
            </div>
            </div>
        </div>
    );
}
