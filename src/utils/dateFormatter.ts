import { format } from 'date-fns';
import { uz, kk, az, hy } from 'date-fns/locale';

// Map of app language codes to date-fns locales
export const dateFnsLocaleMap: Record<string, any> = {
    'uz': uz,
    'kz': kk, 'kk': kk,
    'az': az,
    'hy': hy
};

// Manual fallback for languages not supported by Intl or date-fns (e.g., Tajik)
const manualLocales: Record<string, { monthsShort: string[], monthsLong: string[], daysShort: string[] }> = {
    'tj': {
        monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        monthsLong: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
        daysShort: ['Як', 'Ду', 'Се', 'Чор', 'Пан', 'Ҷум', 'Шан'] // Sun, Mon, Tue...
    },
    'tg': {
        monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        monthsLong: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
        daysShort: ['Як', 'Ду', 'Се', 'Чор', 'Пан', 'Ҷум', 'Шан']
    },
    'kg': {
        monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        monthsLong: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
        daysShort: ['Жш', 'Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш']
    },
    'ky': {
        monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        monthsLong: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
        daysShort: ['Жш', 'Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш']
    }
};

// Helper to map app language codes to standard BCP 47 locales for Intl
export const getValidLocale = (code: string): string => {
    const map: Record<string, string> = {
        'kg': 'ky', // Kyrgyz
        'kz': 'kk', // Kazakh
        'tj': 'tg', // Tajik
    };
    return map[code] || code;
};

const parseDateSafe = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const [_, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Format Date object as "10 Jan 2026"
 */
export const formatDate = (date: Date, locale: string = 'en-GB'): string => {
    // 1. Manual Fallback
    const manual = manualLocales[locale] || manualLocales[getValidLocale(locale)];
    if (manual) {
        const day = date.getDate();
        const month = manual.monthsShort[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    // 2. date-fns Fallback
    const dfLocale = dateFnsLocaleMap[locale];
    if (dfLocale) {
        return format(date, 'dd MMM yyyy', { locale: dfLocale });
    }

    // 3. Intl Native
    const validLocale = getValidLocale(locale);
    return date.toLocaleDateString(validLocale, { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Format date string as "10 Jan 2026"
 */
export const formatDateForDisplay = (dateStr: string, locale: string = 'en-GB'): string => {
    const date = parseDateSafe(dateStr);
    if (!date) return dateStr;
    return formatDate(date, locale);
};

/**
 * Format Month Name: "Jan" or "January"
 */
export const formatMonthName = (date: Date, locale: string = 'en-GB', length: 'short' | 'long' = 'short'): string => {
    const manual = manualLocales[locale] || manualLocales[getValidLocale(locale)];
    if (manual) {
        return length === 'short' ? manual.monthsShort[date.getMonth()] : manual.monthsLong[date.getMonth()];
    }

    const dfLocale = dateFnsLocaleMap[locale];
    if (dfLocale) {
        return format(date, length === 'short' ? 'MMM' : 'MMMM', { locale: dfLocale });
    }
    return date.toLocaleDateString(getValidLocale(locale), { month: length });
};

/**
 * Format Month Year: "January 2026"
 */
export const formatMonthYear = (date: Date, locale: string = 'en-GB'): string => {
    const manual = manualLocales[locale] || manualLocales[getValidLocale(locale)];
    if (manual) {
        return `${manual.monthsLong[date.getMonth()]} ${date.getFullYear()}`;
    }

    const dfLocale = dateFnsLocaleMap[locale];
    if (dfLocale) {
        return format(date, 'MMMM yyyy', { locale: dfLocale });
    }
    return date.toLocaleDateString(getValidLocale(locale), { month: 'long', year: 'numeric' });
};

/**
 * Format Week Day Short: "Mo", "Tu"
 */
export const formatWeekDayShort = (date: Date, locale: string = 'en-GB'): string => {
    const manual = manualLocales[locale] || manualLocales[getValidLocale(locale)];
    if (manual) {
        return manual.daysShort[date.getDay()];
    }

    const dfLocale = dateFnsLocaleMap[locale];
    if (dfLocale) {
        const d = format(date, 'eeeeee', { locale: dfLocale });
        return d;
    }
    const dayName = date.toLocaleDateString(getValidLocale(locale), { weekday: 'short' });
    return dayName.length > 2 ? dayName.slice(0, 2) : dayName;
};

/**
 * Parse user input back to YYYY-MM-DD format
 */
export const parseDateInput = (input: string): string => {
    if (!input) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    try {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch { }
    return input;
};
