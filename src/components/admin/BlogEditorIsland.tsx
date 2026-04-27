/**
 * BlogEditorIsland — reads the post slug from the URL, fetches the row
 * (or prepares an empty row for "new"), and renders BlogEditorForm.
 *
 * The URL pattern is /admin/blog/edit?slug=. A slug of "new" means "create".
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import BlogEditorForm, { type BlogPostFormValues } from './BlogEditorForm';
import { useAuth } from '../auth/AuthContext';

type Locale = 'en' | 'tr';

export default function BlogEditorIsland({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [slug, setSlug] = useState<string | null>(null);
    useEffect(() => {
        const qs = new URLSearchParams(window.location.search).get('slug');
        if (qs) setSlug(decodeURIComponent(qs));
    }, []);

    return (
        <AdminShell
            locale={locale}
            activeKey="blog"
            title="—"
            breadcrumbs={[{ label: 'Blog', href: '/admin/blog' }]}
        >
            {slug ? <Inner slug={slug} locale={locale} /> : null}
        </AdminShell>
    );
}

function Inner({ slug, locale }: { slug: string; locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [initial, setInitial] = useState<BlogPostFormValues | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (slug === 'new') {
                setInitial({
                    id: null,
                    slug: '',
                    title: '',
                    excerpt: '',
                    body_mdx: '',
                    cover_image: '',
                    status: 'draft',
                    tags: [],
                    published_at: null,
                });
                setLoading(false);
                return;
            }
            const { data } = await supabase
                .from('blog_posts')
                .select('id, slug, title, excerpt, body_mdx, cover_image, status, tags, published_at')
                .eq('slug', slug)
                .maybeSingle();
            if (cancelled) return;
            if (data) {
                const r = data as {
                    id: string;
                    slug: string;
                    title: string;
                    excerpt: string | null;
                    body_mdx: string | null;
                    cover_image: string | null;
                    status: 'draft' | 'published';
                    tags: string[] | null;
                    published_at: string | null;
                };
                setInitial({
                    id: r.id,
                    slug: r.slug,
                    title: r.title,
                    excerpt: r.excerpt ?? '',
                    body_mdx: r.body_mdx ?? '',
                    cover_image: r.cover_image ?? '',
                    status: r.status,
                    tags: r.tags ?? [],
                    published_at: r.published_at,
                });
            } else {
                // Fall back to "new with slug prefilled".
                setInitial({
                    id: null,
                    slug,
                    title: '',
                    excerpt: '',
                    body_mdx: '',
                    cover_image: '',
                    status: 'draft',
                    tags: [],
                    published_at: null,
                });
            }
            setLoading(false);
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [slug, supabase]);

    if (loading || !initial) {
        return <div className="text-sm text-ink-muted">{t('common.loading')}</div>;
    }

    return <BlogEditorForm initial={initial} originalSlug={slug} locale={locale} />;
}
