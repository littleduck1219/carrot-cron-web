import { districtList, districts, isDistrictId, type District, type DistrictId } from "./neighborhoods";
export interface Neighborhood extends District { isVerified: true }
export interface PrototypeUser {
    schemaVersion: 2;
    id: string;
    nickname: string;
    verifiedNeighborhoods: Neighborhood[];
    activeNeighborhoodId: DistrictId;
}

// Every supported district is selectable without actual verification in this prototype.
export const defaultUser: PrototypeUser = {
    schemaVersion: 2,
    id: "prototype-user-duck",
    nickname: "duck",
    verifiedNeighborhoods: districtList.map((district) => ({ ...district, isVerified: true })),
    activeNeighborhoodId: "gwanak",
};

// Keep the existing key so valid earlier selections can migrate to district IDs.
export const USER_STORAGE_KEY = "re-carrot.prototype-user.v1";
export function restoreUser(value: unknown): PrototypeUser {
    if (!value || typeof value !== "object") return defaultUser;
    const saved = value as Record<string, unknown>;
    const previous = saved.activeNeighborhoodId;
    let districtId: DistrictId | undefined;
    if (isDistrictId(previous)) districtId = previous;
    else if (previous === "bongcheon") districtId = "gwanak";
    else if (previous === "seocho1") districtId = "seocho";
    else if (previous === "custom" && Array.isArray(saved.verifiedNeighborhoods)) {
        const custom = saved.verifiedNeighborhoods.find((item) => item && item.id === "custom");
        if (typeof custom?.name === "string") {
            const name = custom.name.trim();
            districtId = Object.values(districts).find((item) => item.name === name || item.label === name)?.id;
            if (name === "봉천동") districtId = "gwanak";
            if (name === "서초1동") districtId = "seocho";
        }
    }
    // A city-only label cannot identify a district, so do not guess its child district.
    return { ...defaultUser, activeNeighborhoodId: districtId ?? defaultUser.activeNeighborhoodId };
}
