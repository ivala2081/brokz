/**
 * ISO 3166-1 alpha-2 country list with bilingual names.
 *
 * Stored in DB as alpha-2 code (`"TR"`, `"DE"`, ...). UI displays the
 * localized name from this table. Keeping the list in-repo avoids a
 * runtime dependency and is small enough (<250 entries, ~6KB).
 *
 * Ordering: Türkiye first as primary market, then the rest alphabetical
 * by English name.
 */

export type CountryCode = string;

export interface Country {
    code: CountryCode;
    tr: string;
    en: string;
}

export const COUNTRIES: readonly Country[] = Object.freeze([
    { code: 'TR', tr: 'Türkiye', en: 'Türkiye' },
    { code: '--', tr: '─────────', en: '─────────' },
    { code: 'AF', tr: 'Afganistan', en: 'Afghanistan' },
    { code: 'AL', tr: 'Arnavutluk', en: 'Albania' },
    { code: 'DZ', tr: 'Cezayir', en: 'Algeria' },
    { code: 'AD', tr: 'Andorra', en: 'Andorra' },
    { code: 'AO', tr: 'Angola', en: 'Angola' },
    { code: 'AR', tr: 'Arjantin', en: 'Argentina' },
    { code: 'AM', tr: 'Ermenistan', en: 'Armenia' },
    { code: 'AU', tr: 'Avustralya', en: 'Australia' },
    { code: 'AT', tr: 'Avusturya', en: 'Austria' },
    { code: 'AZ', tr: 'Azerbaycan', en: 'Azerbaijan' },
    { code: 'BH', tr: 'Bahreyn', en: 'Bahrain' },
    { code: 'BD', tr: 'Bangladeş', en: 'Bangladesh' },
    { code: 'BY', tr: 'Belarus', en: 'Belarus' },
    { code: 'BE', tr: 'Belçika', en: 'Belgium' },
    { code: 'BZ', tr: 'Belize', en: 'Belize' },
    { code: 'BO', tr: 'Bolivya', en: 'Bolivia' },
    { code: 'BA', tr: 'Bosna-Hersek', en: 'Bosnia and Herzegovina' },
    { code: 'BR', tr: 'Brezilya', en: 'Brazil' },
    { code: 'BN', tr: 'Brunei', en: 'Brunei' },
    { code: 'BG', tr: 'Bulgaristan', en: 'Bulgaria' },
    { code: 'KH', tr: 'Kamboçya', en: 'Cambodia' },
    { code: 'CM', tr: 'Kamerun', en: 'Cameroon' },
    { code: 'CA', tr: 'Kanada', en: 'Canada' },
    { code: 'CL', tr: 'Şili', en: 'Chile' },
    { code: 'CN', tr: 'Çin', en: 'China' },
    { code: 'CO', tr: 'Kolombiya', en: 'Colombia' },
    { code: 'CR', tr: 'Kosta Rika', en: 'Costa Rica' },
    { code: 'HR', tr: 'Hırvatistan', en: 'Croatia' },
    { code: 'CU', tr: 'Küba', en: 'Cuba' },
    { code: 'CY', tr: 'Kıbrıs', en: 'Cyprus' },
    { code: 'CZ', tr: 'Çekya', en: 'Czechia' },
    { code: 'DK', tr: 'Danimarka', en: 'Denmark' },
    { code: 'DO', tr: 'Dominik Cumhuriyeti', en: 'Dominican Republic' },
    { code: 'EC', tr: 'Ekvador', en: 'Ecuador' },
    { code: 'EG', tr: 'Mısır', en: 'Egypt' },
    { code: 'SV', tr: 'El Salvador', en: 'El Salvador' },
    { code: 'EE', tr: 'Estonya', en: 'Estonia' },
    { code: 'ET', tr: 'Etiyopya', en: 'Ethiopia' },
    { code: 'FI', tr: 'Finlandiya', en: 'Finland' },
    { code: 'FR', tr: 'Fransa', en: 'France' },
    { code: 'GE', tr: 'Gürcistan', en: 'Georgia' },
    { code: 'DE', tr: 'Almanya', en: 'Germany' },
    { code: 'GH', tr: 'Gana', en: 'Ghana' },
    { code: 'GR', tr: 'Yunanistan', en: 'Greece' },
    { code: 'GT', tr: 'Guatemala', en: 'Guatemala' },
    { code: 'HN', tr: 'Honduras', en: 'Honduras' },
    { code: 'HK', tr: 'Hong Kong', en: 'Hong Kong' },
    { code: 'HU', tr: 'Macaristan', en: 'Hungary' },
    { code: 'IS', tr: 'İzlanda', en: 'Iceland' },
    { code: 'IN', tr: 'Hindistan', en: 'India' },
    { code: 'ID', tr: 'Endonezya', en: 'Indonesia' },
    { code: 'IR', tr: 'İran', en: 'Iran' },
    { code: 'IQ', tr: 'Irak', en: 'Iraq' },
    { code: 'IE', tr: 'İrlanda', en: 'Ireland' },
    { code: 'IL', tr: 'İsrail', en: 'Israel' },
    { code: 'IT', tr: 'İtalya', en: 'Italy' },
    { code: 'JM', tr: 'Jamaika', en: 'Jamaica' },
    { code: 'JP', tr: 'Japonya', en: 'Japan' },
    { code: 'JO', tr: 'Ürdün', en: 'Jordan' },
    { code: 'KZ', tr: 'Kazakistan', en: 'Kazakhstan' },
    { code: 'KE', tr: 'Kenya', en: 'Kenya' },
    { code: 'KW', tr: 'Kuveyt', en: 'Kuwait' },
    { code: 'KG', tr: 'Kırgızistan', en: 'Kyrgyzstan' },
    { code: 'LV', tr: 'Letonya', en: 'Latvia' },
    { code: 'LB', tr: 'Lübnan', en: 'Lebanon' },
    { code: 'LY', tr: 'Libya', en: 'Libya' },
    { code: 'LI', tr: 'Lihtenştayn', en: 'Liechtenstein' },
    { code: 'LT', tr: 'Litvanya', en: 'Lithuania' },
    { code: 'LU', tr: 'Lüksemburg', en: 'Luxembourg' },
    { code: 'MO', tr: 'Makao', en: 'Macao' },
    { code: 'MY', tr: 'Malezya', en: 'Malaysia' },
    { code: 'MT', tr: 'Malta', en: 'Malta' },
    { code: 'MX', tr: 'Meksika', en: 'Mexico' },
    { code: 'MD', tr: 'Moldova', en: 'Moldova' },
    { code: 'MC', tr: 'Monako', en: 'Monaco' },
    { code: 'MN', tr: 'Moğolistan', en: 'Mongolia' },
    { code: 'ME', tr: 'Karadağ', en: 'Montenegro' },
    { code: 'MA', tr: 'Fas', en: 'Morocco' },
    { code: 'MM', tr: 'Myanmar', en: 'Myanmar' },
    { code: 'NP', tr: 'Nepal', en: 'Nepal' },
    { code: 'NL', tr: 'Hollanda', en: 'Netherlands' },
    { code: 'NZ', tr: 'Yeni Zelanda', en: 'New Zealand' },
    { code: 'NG', tr: 'Nijerya', en: 'Nigeria' },
    { code: 'MK', tr: 'Kuzey Makedonya', en: 'North Macedonia' },
    { code: 'NO', tr: 'Norveç', en: 'Norway' },
    { code: 'OM', tr: 'Umman', en: 'Oman' },
    { code: 'PK', tr: 'Pakistan', en: 'Pakistan' },
    { code: 'PS', tr: 'Filistin', en: 'Palestine' },
    { code: 'PA', tr: 'Panama', en: 'Panama' },
    { code: 'PY', tr: 'Paraguay', en: 'Paraguay' },
    { code: 'PE', tr: 'Peru', en: 'Peru' },
    { code: 'PH', tr: 'Filipinler', en: 'Philippines' },
    { code: 'PL', tr: 'Polonya', en: 'Poland' },
    { code: 'PT', tr: 'Portekiz', en: 'Portugal' },
    { code: 'QA', tr: 'Katar', en: 'Qatar' },
    { code: 'RO', tr: 'Romanya', en: 'Romania' },
    { code: 'RU', tr: 'Rusya', en: 'Russia' },
    { code: 'RW', tr: 'Ruanda', en: 'Rwanda' },
    { code: 'SA', tr: 'Suudi Arabistan', en: 'Saudi Arabia' },
    { code: 'RS', tr: 'Sırbistan', en: 'Serbia' },
    { code: 'SG', tr: 'Singapur', en: 'Singapore' },
    { code: 'SK', tr: 'Slovakya', en: 'Slovakia' },
    { code: 'SI', tr: 'Slovenya', en: 'Slovenia' },
    { code: 'ZA', tr: 'Güney Afrika', en: 'South Africa' },
    { code: 'KR', tr: 'Güney Kore', en: 'South Korea' },
    { code: 'ES', tr: 'İspanya', en: 'Spain' },
    { code: 'LK', tr: 'Sri Lanka', en: 'Sri Lanka' },
    { code: 'SE', tr: 'İsveç', en: 'Sweden' },
    { code: 'CH', tr: 'İsviçre', en: 'Switzerland' },
    { code: 'SY', tr: 'Suriye', en: 'Syria' },
    { code: 'TW', tr: 'Tayvan', en: 'Taiwan' },
    { code: 'TJ', tr: 'Tacikistan', en: 'Tajikistan' },
    { code: 'TZ', tr: 'Tanzanya', en: 'Tanzania' },
    { code: 'TH', tr: 'Tayland', en: 'Thailand' },
    { code: 'TN', tr: 'Tunus', en: 'Tunisia' },
    { code: 'TM', tr: 'Türkmenistan', en: 'Turkmenistan' },
    { code: 'UG', tr: 'Uganda', en: 'Uganda' },
    { code: 'UA', tr: 'Ukrayna', en: 'Ukraine' },
    { code: 'AE', tr: 'Birleşik Arap Emirlikleri', en: 'United Arab Emirates' },
    { code: 'GB', tr: 'Birleşik Krallık', en: 'United Kingdom' },
    { code: 'US', tr: 'Amerika Birleşik Devletleri', en: 'United States' },
    { code: 'UY', tr: 'Uruguay', en: 'Uruguay' },
    { code: 'UZ', tr: 'Özbekistan', en: 'Uzbekistan' },
    { code: 'VE', tr: 'Venezuela', en: 'Venezuela' },
    { code: 'VN', tr: 'Vietnam', en: 'Vietnam' },
    { code: 'YE', tr: 'Yemen', en: 'Yemen' },
    { code: 'ZM', tr: 'Zambiya', en: 'Zambia' },
    { code: 'ZW', tr: 'Zimbabve', en: 'Zimbabwe' },
]);

const BY_CODE = new Map<CountryCode, Country>(COUNTRIES.map((c) => [c.code, c]));

/** Friendly name for a stored ISO code, or the code itself if unknown. */
export function countryLabel(code: string | null | undefined, locale: 'tr' | 'en'): string {
    if (!code) return '—';
    const hit = BY_CODE.get(code.toUpperCase());
    if (!hit) return code;
    return locale === 'en' ? hit.en : hit.tr;
}

/** Returns a list sorted by the locale's name column (keeping TR pinned). */
export function sortedCountries(locale: 'tr' | 'en'): Country[] {
    const [pinned, ...rest] = COUNTRIES;
    const [divider, ...others] = rest;
    const key = locale === 'en' ? 'en' : 'tr';
    const sorted = [...others].sort((a, b) =>
        a[key].localeCompare(b[key], locale === 'en' ? 'en' : 'tr'),
    );
    return [pinned, divider, ...sorted];
}
