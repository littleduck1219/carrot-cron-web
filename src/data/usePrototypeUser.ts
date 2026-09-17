import { useEffect, useState } from "react";
import { defaultUser, guestUser, prototypeUsers, USER_STORAGE_KEY } from "./userData";

export function usePrototypeUser() {
    const [user, setUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? "null");
            return prototypeUsers.find(item => item.id === saved?.id) ?? defaultUser;
        } catch { return defaultUser; }
    });
    useEffect(() => {
        try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); }
        catch { /* Switching still works when storage is unavailable. */ }
    }, [user]);
    // Battery: 박경덕 ↔ 유주연 (from 아무개, back to 박경덕). Wi-Fi: 아무개 (from 아무개, back to 박경덕).
    const switchUser = () => setUser(current => prototypeUsers[current.id === defaultUser.id ? 1 : 0]);
    const switchGuest = () => setUser(current => current.id === guestUser.id ? defaultUser : guestUser);
    return { user, activeNeighborhood: user.verifiedNeighborhoods[0], switchUser, switchGuest };
}
