import { ActionButton } from "@seed-design/react";
import { useEffect, useRef, useState } from "react";
import { cities, districtList, provinces } from "../data/neighborhoods";
import type { PrototypeUser } from "../data/userData";
import "./NeighborhoodSwitcher.css";

interface Props { user: PrototypeUser; onSelect: (id: string) => void }
export function NeighborhoodSwitcher({ user, onSelect }: Props) {
    const active = user.verifiedNeighborhoods.find((item) => item.id === user.activeNeighborhoodId)!;
    const [open, setOpen] = useState(false);
    const [provinceId, setProvinceId] = useState(active.provinceId);
    const [cityId, setCityId] = useState(active.cityId ?? "");
    const [districtId, setDistrictId] = useState(active.id);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const dismiss = (event: PointerEvent) => {
            if (event.target instanceof Node && !panelRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", dismiss);
        return () => document.removeEventListener("pointerdown", dismiss);
    }, [open]);
    const availableCities = cities.filter((item) => item.provinceId === provinceId);
    const availableDistricts = districtList.filter((item) => item.provinceId === provinceId && (item.cityId ?? "") === cityId);
    const selected = availableDistricts.find((item) => item.id === districtId);
    const close = () => { setOpen(false); triggerRef.current?.focus(); };
    const toggle = () => {
        if (!open) { setProvinceId(active.provinceId); setCityId(active.cityId ?? ""); setDistrictId(active.id); }
        setOpen(!open);
    };

    return <div className="neighborhood-switcher" ref={panelRef} onKeyDown={(event) => {
        if (event.key === "Escape" && open) { event.stopPropagation(); close(); }
    }} onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
        <button ref={triggerRef} className="neighborhood-trigger" type="button" aria-expanded={open}
            aria-controls="neighborhood-options" title={active.label} onClick={toggle}>
            <span>인증동네</span><strong>{active.name}</strong><span aria-hidden="true">⌄</span>
        </button>
        {open && <section id="neighborhood-options" className="neighborhood-panel" aria-label="인증동네 변경">
            <div className="neighborhood-panel-heading"><strong>{user.nickname}님의 인증동네</strong>
                <button type="button" aria-label="인증동네 설정 닫기" onClick={close}>×</button>
            </div>
            <p className="neighborhood-current">현재: {active.label}</p>
            <form onSubmit={(event) => { event.preventDefault(); if (selected) { onSelect(selected.id); close(); } }}>
                <label htmlFor="neighborhood-province">시·도</label>
                <select id="neighborhood-province" value={provinceId} onChange={(event) => {
                    setProvinceId(event.target.value); setCityId(""); setDistrictId("");
                }}>
                    {provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                {availableCities.length > 0 && <>
                    <label htmlFor="neighborhood-city">시</label>
                    <select id="neighborhood-city" value={cityId} onChange={(event) => { setCityId(event.target.value); setDistrictId(""); }}>
                        <option value="" disabled>시를 선택해 주세요</option>
                        {availableCities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </>}
                <label htmlFor="neighborhood-district">구</label>
                <select id="neighborhood-district" value={districtId} disabled={availableDistricts.length === 0} onChange={(event) => setDistrictId(event.target.value)}>
                    <option value="" disabled>구를 선택해 주세요</option>
                    {availableDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <p className="neighborhood-selection" aria-live="polite">{selected?.label ?? "구까지 선택해 주세요."}</p>
                <ActionButton type="submit" size="medium" variant="brandSolid" disabled={!selected} className="neighborhood-apply">적용</ActionButton>
            </form>
        </section>}
    </div>;
}
