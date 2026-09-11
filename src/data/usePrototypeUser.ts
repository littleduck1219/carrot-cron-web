import { useEffect, useState } from "react";
import { isDistrictId } from "./neighborhoods";
import { defaultUser, restoreUser, USER_STORAGE_KEY } from "./userData";

export function usePrototypeUser() {
    const [user, setUser] = useState(() => {
        try { return restoreUser(JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? "null")); }
        catch { return defaultUser; }
    });
    useEffect(() => {
        try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); }
        catch { /* Keep the current session usable if storage is unavailable. */ }
    }, [user]);
    const selectNeighborhood = (id: string) => {
        if (!isDistrictId(id)) return;
        setUser((current) => ({ ...current, activeNeighborhoodId: id }));
    };
    const activeNeighborhood = user.verifiedNeighborhoods.find((item) => item.id === user.activeNeighborhoodId)!;
    return { user, activeNeighborhood, selectNeighborhood };
}
