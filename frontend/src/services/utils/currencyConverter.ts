import axios from 'axios';

let exchangeRate = 1;
let lastFetched = 0;
const TTL = 60 * 60 * 1000 * 24;

export async function fetchExchangeRate() {
    const now = Date.now();
    if (now - lastFetched < TTL && exchangeRate !== 1) {
        return;
    }

    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        exchangeRate = response.data.rates.UAH;
        lastFetched = now;
    } catch (err) {
        console.error('Error fetching exchange rate:', err);
    }
}

const currencySymbols: Record<string, string> = {
    UAH: '₴',
    USD: '$',
};

export function convertPrice(price: number, from: 'USD' | 'UAH', to: 'USD' | 'UAH'): number {
    if (from === to) return roundToTwo(price);

    if (from === 'USD' && to === 'UAH') {
        return roundToTwo(price * exchangeRate);
    } else if (from === 'UAH' && to === 'USD') {
        return roundToTwo(price / exchangeRate);
    }

    throw new Error(`Unsupported currency conversion: ${from} to ${to}`);
}

function roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
}

export function formatPrice(price: number, currency: 'USD' | 'UAH' = 'UAH') {
    const locales = {
        UAH: 'uk-UA',
        USD: 'en-US',
    };

    const symbol = currencySymbols[currency] || currency;
    const locale = locales[currency] || 'en-US';

    return `${price.toLocaleString(locale, { minimumFractionDigits: 2 })} ${symbol}`;
}
