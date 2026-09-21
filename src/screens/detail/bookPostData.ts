import { publicAsset } from '../../data/publicAsset';
import type { ProductCard, SourceRegion } from './productData';

const photo = (source: string, x: number, y: number, width = 199, height = 149): SourceRegion => ({ source: publicAsset(`reference/it-books/${source}.jpg`), x, y, width, height });
const card = (source: string, x: number, y: number, title: string, price: string): ProductCard => ({ title, price, photo: photo(source, x, y) });

export const bookPostSimilar: ProductCard[] = [
    card('7', 16, 224, 'IT 프로그래밍 개발 서적 (새 책 수…', '4,000원'),
    card('7', 225, 224, '개발 서적 판매 (새책)', '1,111원'),
    card('7', 16, 443, 'IT, 개발, 프로그래밍, 컴퓨터 공학…', '8,000원'),
    card('7', 225, 443, 'IT 개발 서적 개당 4천원', '4,000원'),
    card('7', 16, 662, 'IT 개발 관련 서적', '4,000원'),
    card('7', 225, 662, '책팔아요 개별구매 가능', '80,000원'),
    card('8', 16, 370, '코딩책 10개', '40,000원'),
    card('8', 225, 370, '다양한 분야의 중고 IT/개발 서적…', '5,000원'),
    card('8', 16, 590, 'IT개발 서적 모음 (자바, 자바스크…', '2,000원'),
    card('8', 225, 590, '개발 도서 정리합니다', '6,000원'),
    card('9', 16, 443, 'IT 개발 서적 판매합니다', '4,000원'),
    card('9', 225, 443, '개발 서적 4권 일괄 나눔', '나눔🧡'),
    card('9', 16, 662, '개발자 전공서적 정리 📚 SQL/Or…', '5,000원'),
    card('9', 225, 662, '개발 프로그래밍 자습서 판매', '31,500원'),
    card('10', 16, 151, '개발 도서 판매', '10,000원'),
    card('10', 225, 151, '중고 IT / 프로그래밍 서적 권당 1,…', '1,000원'),
    card('10', 16, 521, '기술서적 판매', '2,000원'),
    card('10', 225, 521, '새 책 포함 IT 개발 서적', '3,000원'),
];
