/**
 * BlogTable — Blog posts list.
 *
 * Phase 1 "delete" is hard delete via Supabase (migration has no deleted_at
 * on blog_posts). Flagged in the handoff report — db-architect may prefer
 * to add a soft-delete column.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import { useAuth } from '../../auth/AuthContext';
import { toast } from '../../ui/Toast';
import { formatDate } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    slug: string;
    title: string;
    status: string;
    published_at: string | null;
    updated_at: string;
    author_profile: {
        id: string;
        email: string | null;
        full_name: string | null;
    } | null;
}

const STATUS_OPTIONS = ['all', 'draft', 'published'];

export default function BlogTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="blog"
            title={t('blog.title')}
            subtitle={t('blog.subtitle')}
        >
            <BlogInner locale={locale} />
        </AdminShell>
    );
}

function BlogInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('blog_posts')
            .select('id, slug, title, status, published_at, updated_at, author_profile:profiles!blog_posts_author_fkey(id, email, full_name)')
            .order('updated_at', { ascending: false });
        if (status !== 'all') query = query.eq('status', status);
        const { data } = await query;
        setRows((data as unknown as Row[]) ?? []);
        setLoading(false);
    }, [supabase, status]);

    useEffect(() => {
        void load();
    }, [load]);

    async function togglePublish(r: Row) {
        const next = r.status === 'published' ? 'draft' : 'published';
        const { error } = await supabase
            .from('blog_posts')
            .update({
                status: next,
                published_at: next === 'published' ? r.published_at ?? new Date().toISOString() : null,
            })
            .eq('id', r.id);
        if (error) {
            toast.error(t('blog.editor.error'));
            return;
        }
        toast.success(next === 'published' ? t('blog.editor.publishedSuccess') : t('blog.editor.unpublishedSuccess'));
        void load();
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'title',
            header: t('blog.columns.title'),
            cell: (r) => (
                <a
                    href={`/admin/blog/edit?slug=${r.slug}`}
                    className="font-medium text-ink hover:text-brand"
                >
                    {r.title}
                    <div className="text-2xs text-ink-muted font-mono">{r.slug}</div>
                </a>
            ),
            sortable: true,
            searchAccessor: (r) => r.title,
        },
        {
            key: 'status',
            header: t('blog.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'author',
            header: t('blog.columns.author'),
            cell: (r) => (
                <span className="text-ink-secondary">
                    {r.author_profile?.full_name ?? r.author_profile?.email ?? '—'}
                </span>
            ),
            searchAccessor: (r) => r.author_profile?.email ?? '',
        },
        {
            key: 'publishedAt',
            header: t('blog.columns.publishedAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.published_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.published_at ?? '',
        },
        {
            key: 'updatedAt',
            header: t('blog.columns.updatedAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.updated_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.updated_at,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right flex justify-end gap-1.5">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.location.assign(`/admin/blog/edit?slug=${r.slug}`)}
                    >
                        {t('common.edit')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void togglePublish(r)}>
                        {r.status === 'published' ? t('blog.editor.unpublish') : t('blog.editor.saveAndPublish')}
                    </Button>
                </div>
            ),
            align: 'right',
        },
    ];

    return (
        <DataTable<Row>
            data={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            searchPlaceholder={t('common.search')}
            labels={{
                search: t('common.search'),
                previous: t('common.previous'),
                next: t('common.next'),
                rowCount: (n) => `${n}`,
                pageOf: (c, tot) => `${c} / ${tot}`,
                noResults: t('common.none'),
            }}
            filter={{
                label: t('common.filter'),
                value: status,
                onChange: setStatus,
                options: STATUS_OPTIONS.map((v) => ({
                    value: v,
                    label: v === 'all' ? t('common.all') : t(`status.${v}`),
                })),
            }}
            toolbar={
                <Button onClick={() => window.location.assign('/admin/blog/edit?slug=new')}>
                    {t('blog.new')}
                </Button>
            }
            emptyState={
                <EmptyState
                    title={t('blog.empty.title')}
                    description={t('blog.empty.description')}
                    action={
                        <Button onClick={() => window.location.assign('/admin/blog/edit?slug=new')}>
                            {t('blog.empty.cta')}
                        </Button>
                    }
                />
            }
        />
    );
}
