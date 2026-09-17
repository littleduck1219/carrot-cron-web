// Supported prototype districts. IDs are local keys, not official administrative codes.
export const provinces = [
    { id: "seoul", name: "서울특별시" },
    { id: "gyeonggi", name: "경기도" },
] as const;
export const cities = [{ id: "seongnam", provinceId: "gyeonggi", name: "성남시" }] as const;

export interface District {
    id: string;
    name: string;
    label: string;
    provinceId: string;
    cityId: string | null;
}

export const districts = {
    gwanak: { id: "gwanak", name: "관악구", label: "서울특별시 관악구", provinceId: "seoul", cityId: null },
    seocho: { id: "seocho", name: "서초구", label: "서울특별시 서초구", provinceId: "seoul", cityId: null },
    gangnam: { id: "gangnam", name: "강남구", label: "서울특별시 강남구", provinceId: "seoul", cityId: null },
    yongsan: { id: "yongsan", name: "용산구", label: "서울특별시 용산구", provinceId: "seoul", cityId: null },
    bundang: { id: "bundang", name: "분당구", label: "경기도 성남시 분당구", provinceId: "gyeonggi", cityId: "seongnam" },
} as const satisfies Record<string, District>;
export type DistrictId = keyof typeof districts;
export const districtList: readonly District[] = Object.values(districts);
export function isDistrictId(value: unknown): value is DistrictId {
    return typeof value === "string" && Object.hasOwn(districts, value);
}
