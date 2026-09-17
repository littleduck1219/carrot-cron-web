export interface SaleItem {
    id: string;
    name: string;
    price: string;
    // null means a single item; a number enables the optional quantity field.
    quantity: number | null;
}

export function validQuantity(value: unknown): number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 ? value : 1;
}

export function restoreSaleItems(value: unknown, previousPrice: unknown = ''): SaleItem[] {
    const rows = Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [];
    if (!rows.length) rows.push({ price: previousPrice });
    return rows.map((item, index) => ({
        id: `item-${index + 1}`,
        name: typeof item.name === 'string' ? item.name : '',
        price: typeof item.price === 'string' ? item.price.replace(/\D/g, '').slice(0, 12) : '',
        quantity: item.quantity == null ? null : validQuantity(item.quantity),
    }));
}
