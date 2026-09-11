import { districts, type DistrictId } from "./neighborhoods";

interface Seller { id: string; nickname: string; districtId: DistrictId }
export const sellers = {
    raum: { id: "raum", nickname: "라움", districtId: "gwanak" },
    dudu: { id: "dudu", nickname: "두두", districtId: "bundang" },
} as const satisfies Record<string, Seller>;
export type SellerId = keyof typeof sellers;
export function getSellerDistrict(sellerId: SellerId) {
    return districts[sellers[sellerId].districtId];
}
