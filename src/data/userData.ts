import { type District } from "./neighborhoods";
export interface Neighborhood extends District { isVerified: true }
export interface PrototypeUser {
    schemaVersion: 3;
    id: string;
    nickname: string;
    verifiedNeighborhoods: Neighborhood[];
    activeNeighborhoodId: string;
    tradePlace: string;
    pickupAddress: string;
}

// Account regions are fixed province-level fixtures, not GPS distance calculations.
export const defaultUser: PrototypeUser = {
    schemaVersion: 3,
    id: "prototype-user-park",
    nickname: "박경덕",
    verifiedNeighborhoods: [
        { id: "seoul", provinceId: "seoul", cityId: null, name: "서울특별시", label: "서울특별시", isVerified: true },
    ],
    activeNeighborhoodId: "seoul",
    tradePlace: "서울특별시",
    pickupAddress: "서울특별시",
};
export const USER_STORAGE_KEY = "re-carrot.prototype-user.v1";

export const prototypeUsers: PrototypeUser[] = [defaultUser, { ...defaultUser, id: "prototype-user-yoo", nickname: "유주연",
    verifiedNeighborhoods: [{ id: "gyeongbuk", provinceId: "gyeongbuk", cityId: null, name: "경상북도", label: "경상북도", isVerified: true }],
    activeNeighborhoodId: "gyeongbuk", tradePlace: "경상북도", pickupAddress: "경상북도",
}, {
    // Third-party viewer for checking sold/other-user states (added 2026-09-17). Region unverified: 서울특별시 assumed.
    ...defaultUser, id: "prototype-user-anon", nickname: "아무개",
}];
export const guestUser = prototypeUsers[2];
