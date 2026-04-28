import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, AsYouType } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

function codeToFlag(code: string): string {
    return [...code.toUpperCase()].map(c =>
        String.fromCodePoint(c.codePointAt(0)! - 65 + 0x1F1E6)
    ).join('');
}

const regionNames = typeof Intl !== 'undefined'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

interface CountryOption {
    code: CountryCode;
    dialCode: string;
    name: string;
    flag: string;
}

const ALL_COUNTRIES: CountryOption[] = getCountries()
    .map(code => ({
        code: code as CountryCode,
        dialCode: '+' + getCountryCallingCode(code),
        name: regionNames?.of(code) ?? code,
        flag: codeToFlag(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY = ALL_COUNTRIES.find(c => c.code === 'TR') ?? ALL_COUNTRIES[0]!;

interface PhoneInputProps {
    id?: string;
    hasError?: boolean;
    searchPlaceholder?: string;
    noResultsText?: string;
    onChange: (e164: string, valid: boolean) => void;
}

export default function PhoneInput({
    id = 'lf-phone',
    hasError,
    searchPlaceholder = 'Search countries…',
    noResultsText = 'No results',
    onChange,
}: PhoneInputProps) {
    const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
    const [nationalNumber, setNationalNumber] = useState('');
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Auto-detect country: IP first, browser language fallback
    useEffect(() => {
        const browserCountry = (): CountryOption | null => {
            const lang = navigator.language || '';
            const parts = lang.split('-');
            const code = (parts.length > 1 ? parts[1] : parts[0]).toUpperCase() as CountryCode;
            return ALL_COUNTRIES.find(c => c.code === code) ?? null;
        };

        let cancelled = false;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);

        fetch('https://ipapi.co/json/', { signal: controller.signal })
            .then(r => r.json())
            .then((d: Record<string, unknown>) => {
                if (cancelled) return;
                const found = typeof d.country_code === 'string'
                    ? ALL_COUNTRIES.find(c => c.code === d.country_code)
                    : null;
                const resolved = found ?? browserCountry();
                if (resolved) setCountry(resolved);
            })
            .catch(() => {
                if (cancelled) return;
                const bc = browserCountry();
                if (bc) setCountry(bc);
            })
            .finally(() => clearTimeout(timer));

        return () => { cancelled = true; };
    }, []);

    // Close dropdown on outside click / Escape
    useEffect(() => {
        if (!open) return;
        const onMouse = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setOpen(false); setSearch(''); }
        };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    // Focus search on open
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => searchRef.current?.focus(), 30);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Scroll selected item into view on open
    useEffect(() => {
        if (open && listRef.current) {
            const selected = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null;
            selected?.scrollIntoView({ block: 'nearest' });
        }
    }, [open]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return ALL_COUNTRIES;
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.dialCode.includes(q) ||
            c.code.toLowerCase().includes(q)
        );
    }, [search]);

    const emitChange = useCallback((nationalDigits: string, forCountry: CountryOption) => {
        if (!nationalDigits) { onChange('', false); return; }
        const full = forCountry.dialCode + nationalDigits;
        const valid = isValidPhoneNumber(full, forCountry.code);
        onChange(full, valid);
    }, [onChange]);

    const handleNumberChange = useCallback((raw: string) => {
        const cleaned = raw.replace(/[^\d\s\-().]/g, '');
        const formatter = new AsYouType(country.code);
        const formatted = formatter.input(cleaned);
        setNationalNumber(formatted);
        emitChange(cleaned.replace(/\D/g, ''), country);
    }, [country, emitChange]);

    const handleCountrySelect = useCallback((c: CountryOption) => {
        setCountry(c);
        setOpen(false);
        setSearch('');
        emitChange(nationalNumber.replace(/\D/g, ''), c);
    }, [nationalNumber, emitChange]);

    return (
        <div className="relative flex" ref={wrapperRef}>
            {/* Country dial code button */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Country: ${country.name}, dial code ${country.dialCode}`}
                className={[
                    'flex items-center gap-1.5 px-3 py-2.5 shrink-0',
                    'border rounded-l-card border-r-0',
                    'bg-surface hover:bg-surface-raised transition-colors',
                    'text-sm font-medium text-ink min-w-[88px]',
                    hasError ? 'border-red-400' : 'border-line',
                    open ? 'ring-2 ring-inset ring-brand/30' : '',
                ].join(' ')}
            >
                <span className="text-base leading-none select-none">{country.flag}</span>
                <span className="text-ink-secondary tabular-nums">{country.dialCode}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`ml-auto text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* National number input */}
            <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={nationalNumber}
                onChange={e => handleNumberChange(e.target.value)}
                placeholder="— — — — — —"
                aria-invalid={hasError}
                className={[
                    'input flex-1 rounded-l-none',
                    hasError ? 'border-red-400' : '',
                ].join(' ')}
            />

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-surface border border-line rounded-card-sm shadow-elevation overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-line">
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full px-3 py-1.5 text-sm bg-surface-raised border border-line rounded-card-sm outline-none focus:ring-2 focus:ring-brand/20 text-ink placeholder:text-ink-muted"
                        />
                    </div>

                    {/* Country list */}
                    <ul
                        ref={listRef}
                        role="listbox"
                        aria-label="Select country"
                        className="overflow-y-auto max-h-56 overscroll-contain"
                    >
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2.5 text-sm text-ink-muted">{noResultsText}</li>
                        ) : filtered.map(c => (
                            <li
                                key={c.code}
                                role="option"
                                aria-selected={c.code === country.code}
                                onClick={() => handleCountrySelect(c)}
                                className={[
                                    'flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm select-none',
                                    'hover:bg-surface-raised transition-colors',
                                    c.code === country.code ? 'bg-brand-subtle text-brand font-medium' : 'text-ink',
                                ].join(' ')}
                            >
                                <span className="text-base leading-none w-6 shrink-0">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-ink-muted shrink-0 tabular-nums text-xs">{c.dialCode}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
