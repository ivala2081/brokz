/**
 * DataTable — generic table with search, column filter, sort, pagination.
 *
 * Client-side only for Phase 1. Server-side pagination comes later once
 * volumes justify it. Consumers pass a `columns` config and `data`; table
 * renders header, rows, empty state slot, loading skeleton, and pager.
 *
 * Intentionally framework-free (no tanstack/react-table) — keeps the
 * bundle small and behaviour explicit.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SkeletonTable } from './Skeleton';

export interface DataTableColumn<T> {
    key: string;
    header: ReactNode;
    /** Accessor for the cell content. Return a primitive or a ReactNode. */
    cell: (row: T) => ReactNode;
    /** Accessor used for sort + global search. Must be a comparable primitive. */
    sortable?: boolean;
    searchAccessor?: (row: T) => string | number | null | undefined;
    /** Width/alignment helpers */
    className?: string;
    headerClassName?: string;
    align?: 'left' | 'right' | 'center';
}

export interface DataTableFilterOption {
    label: string;
    value: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;
    getRowId: (row: T) => string;
    /** Clicking a row fires this (e.g. navigate to detail). */
    onRowClick?: (row: T) => void;
    /** Shown above the table on the right. Typically an action button. */
    toolbar?: ReactNode;
    /** Placeholder in the search input. */
    searchPlaceholder?: string;
    /** Optional filter dropdown shown next to the search box. */
    filter?: {
        label: string;
        value: string;
        options: DataTableFilterOption[];
        onChange: (value: string) => void;
    };
    /** Renders instead of rows when data.length === 0 after load. */
    emptyState?: ReactNode;
    /** Rows per page. Defaults to 25. */
    pageSize?: number;
    /** Initial sort (column key + direction) */
    initialSort?: { key: string; dir: 'asc' | 'desc' };
    /** Localized labels so we can pass i18n strings in. */
    labels?: Partial<{
        search: string;
        previous: string;
        next: string;
        pageOf: (current: number, total: number) => string;
        rowCount: (count: number) => string;
        noResults: string;
    }>;
}

const DEFAULT_LABELS = {
    search: 'Search',
    previous: 'Previous',
    next: 'Next',
    pageOf: (c: number, t: number) => `Page ${c} of ${t}`,
    rowCount: (n: number) => `${n} row${n === 1 ? '' : 's'}`,
    noResults: 'No results.',
};

export default function DataTable<T>({
    data,
    columns,
    loading,
    getRowId,
    onRowClick,
    toolbar,
    searchPlaceholder,
    filter,
    emptyState,
    pageSize = 25,
    initialSort,
    labels,
}: DataTableProps<T>) {
    const L = { ...DEFAULT_LABELS, ...(labels ?? {}) };
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(
        initialSort ?? null,
    );

    const searchable = useMemo(
        () => columns.filter((c) => c.searchAccessor),
        [columns],
    );

    const filteredSorted = useMemo(() => {
        let rows = data;
        const q = query.trim().toLowerCase();
        if (q) {
            rows = rows.filter((row) =>
                searchable.some((col) => {
                    const v = col.searchAccessor?.(row);
                    if (v === null || v === undefined) return false;
                    return String(v).toLowerCase().includes(q);
                }),
            );
        }
        if (sort) {
            const col = columns.find((c) => c.key === sort.key);
            const accessor = col?.searchAccessor;
            if (accessor) {
                rows = [...rows].sort((a, b) => {
                    const av = accessor(a) ?? '';
                    const bv = accessor(b) ?? '';
                    if (av === bv) return 0;
                    const dir = sort.dir === 'asc' ? 1 : -1;
                    return av > bv ? dir : -dir;
                });
            }
        }
        return rows;
    }, [data, query, sort, searchable, columns]);

    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pageRows = filteredSorted.slice(pageStart, pageStart + pageSize);

    function toggleSort(key: string) {
        setSort((prev) => {
            if (!prev || prev.key !== key) return { key, dir: 'asc' };
            if (prev.dir === 'asc') return { key, dir: 'desc' };
            return null;
        });
    }

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-1 items-center gap-2 max-w-md">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder={searchPlaceholder ?? L.search}
                        className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {filter && (
                        <select
                            value={filter.value}
                            onChange={(e) => {
                                filter.onChange(e.target.value);
                                setPage(1);
                            }}
                            aria-label={filter.label}
                            className="h-9 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        >
                            {filter.options.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
            </div>

            <div className="rounded-lg border border-line bg-white overflow-hidden">
                {loading ? (
                    <div className="p-6">
                        <SkeletonTable rows={6} cols={columns.length} />
                    </div>
                ) : pageRows.length === 0 ? (
                    <div className="p-0">
                        {emptyState ?? (
                            <div className="p-12 text-center text-sm text-ink-muted">
                                {L.noResults}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface-muted border-b border-line">
                                <tr>
                                    {columns.map((col) => {
                                        const isSorted = sort?.key === col.key;
                                        return (
                                            <th
                                                key={col.key}
                                                scope="col"
                                                className={cn(
                                                    'px-4 h-11 text-left text-2xs font-semibold uppercase tracking-[0.08em] text-ink-muted bg-surface-muted/60',
                                                    col.align === 'right' && 'text-right',
                                                    col.align === 'center' && 'text-center',
                                                    col.sortable && 'cursor-pointer select-none',
                                                    col.headerClassName,
                                                )}
                                                onClick={() => col.sortable && toggleSort(col.key)}
                                                aria-sort={
                                                    isSorted
                                                        ? sort!.dir === 'asc'
                                                            ? 'ascending'
                                                            : 'descending'
                                                        : undefined
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {col.header}
                                                    {col.sortable && (
                                                        <SortIndicator
                                                            active={isSorted}
                                                            dir={sort?.dir ?? null}
                                                        />
                                                    )}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {pageRows.map((row) => {
                                    const id = getRowId(row);
                                    return (
                                        <tr
                                            key={id}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            className={cn(
                                                'h-14 transition-colors',
                                                onRowClick && 'cursor-pointer hover:bg-surface-muted',
                                            )}
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={cn(
                                                        'px-4 py-0 text-sm text-ink align-middle',
                                                        col.align === 'right' && 'text-right',
                                                        col.align === 'center' && 'text-center',
                                                        col.className,
                                                    )}
                                                >
                                                    {col.cell(row)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && filteredSorted.length > 0 && (
                <div className="flex items-center justify-between mt-3 text-xs text-ink-muted">
                    <span>{L.rowCount(filteredSorted.length)}</span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={safePage === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="h-8 rounded-md border border-line bg-white px-3 text-xs text-ink disabled:opacity-40 hover:border-ink/30"
                            >
                                {L.previous}
                            </button>
                            <span>{L.pageOf(safePage, totalPages)}</span>
                            <button
                                type="button"
                                disabled={safePage === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="h-8 rounded-md border border-line bg-white px-3 text-xs text-ink disabled:opacity-40 hover:border-ink/30"
                            >
                                {L.next}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SortIndicator({ active, dir }: { active: boolean; dir: 'asc' | 'desc' | null }) {
    return (
        <span className="inline-block text-ink-muted" aria-hidden="true">
            {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );
}
