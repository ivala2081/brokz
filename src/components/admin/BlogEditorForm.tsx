/**
 * BlogEditorForm — blog post CRUD form for /admin/blog/edit?slug=.
 *
 * Phase 1: monospace textarea for MDX body, no rich editor yet. Accepts
 * cover image URL — Storage upload comes in Phase 3.
 *
 * Data model (from foundation migration):
 *   id, slug, title, excerpt, body_mdx, cover_image, author, status,
 *   published_at, tags[]
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Field from '../ui/Field';
import StatusBadge from './StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';
import { resolveAdminLocale } from '../../lib/admin/locale';

export interface BlogPostFormValues {
    id: string | null;
    slug: string;
    title: string;
    excerpt: string;
    body_mdx: string;
    cover_image: string;
    status: 'draft' | 'published';
    tags: string[];
    published_at: string | null;
}

export interface BlogEditorFormProps {
    initial: BlogPostFormValues;
    /** Slug of the post being edited, for redirect after slug change. */
    originalSlug: string;
    locale?: 'en' | 'tr';
}

function slugify(v: string): string {
    return v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function BlogEditorForm({ initial, originalSlug, locale: localeProp = 'tr' }: BlogEditorFormProps) {
    const locale = resolveAdminLocale(localeProp);
    const { t, i18n } = useTranslation('admin');
    const { supabase, user } = useAuth();
    const [form, setForm] = useState<BlogPostFormValues>(initial);
    const [tagsInput, setTagsInput] = useState<string>(initial.tags.join(', '));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
    }, [i18n, locale]);

    function update<K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function persist(nextStatus?: 'draft' | 'published') {
        setSaving(true);
        const newStatus = nextStatus ?? form.status;
        const payload = {
            slug: form.slug || slugify(form.title),
            title: form.title,
            excerpt: form.excerpt || null,
            body_mdx: form.body_mdx || null,
            cover_image: form.cover_image || null,
            status: newStatus,
            tags: tagsInput
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            published_at:
                newStatus === 'published'
                    ? form.published_at ?? new Date().toISOString()
                    : null,
            author: user.id,
        };

        const { data, error } = form.id
            ? await supabase.from('blog_posts').update(payload).eq('id', form.id).select().single()
            : await supabase.from('blog_posts').insert(payload).select().single();

        setSaving(false);

        if (error || !data) {
            toast.error(t('blog.editor.error'));
            return;
        }

        toast.success(
            newStatus === 'published'
                ? t('blog.editor.publishedSuccess')
                : t('blog.editor.success'),
        );

        // If slug changed, redirect to the new edit URL.
        const savedSlug = (data as { slug: string }).slug;
        if (savedSlug !== originalSlug) {
            window.location.assign(`/admin/blog/edit?slug=${encodeURIComponent(savedSlug)}`);
        } else {
            setForm((f) => ({ ...f, status: newStatus, id: (data as { id: string }).id }));
        }
    }

    async function handleDelete() {
        if (!form.id) return;
        const ok = window.confirm(t('blog.editor.deleteConfirm'));
        if (!ok) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', form.id);
        if (error) {
            toast.error(t('blog.editor.error'));
            return;
        }
        toast.success(t('blog.editor.deletedSuccess'));
        window.location.assign('/admin/blog');
    }

    async function handleUnpublish() {
        if (!form.id) return;
        setSaving(true);
        const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'draft', published_at: null })
            .eq('id', form.id);
        setSaving(false);
        if (error) {
            toast.error(t('blog.editor.error'));
            return;
        }
        toast.success(t('blog.editor.unpublishedSuccess'));
        setForm((f) => ({ ...f, status: 'draft', published_at: null }));
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void persist();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <a
                    href="/admin/blog"
                    className="text-xs text-ink-muted hover:text-ink"
                >
                    ← {t('blog.editor.back')}
                </a>
                <div className="flex items-center gap-2">
                    <StatusBadge status={form.status} />
                </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-6 space-y-5">
                <Field label={t('blog.editor.title')} required>
                    <Input
                        value={form.title}
                        onChange={(e) => {
                            update('title', e.target.value);
                            if (!form.id && !form.slug) update('slug', slugify(e.target.value));
                        }}
                        required
                    />
                </Field>
                <Field label={t('blog.editor.slug')} required>
                    <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} required />
                </Field>
                <Field label={t('blog.editor.excerpt')}>
                    <Textarea
                        value={form.excerpt}
                        onChange={(e) => update('excerpt', e.target.value)}
                        rows={2}
                    />
                </Field>
                <Field label={t('blog.editor.coverImage')}>
                    <Input
                        type="url"
                        value={form.cover_image}
                        onChange={(e) => update('cover_image', e.target.value)}
                        placeholder="https://"
                    />
                </Field>
                <Field label={t('blog.editor.tags')} hint={t('blog.editor.tagsHint')}>
                    <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
                </Field>
                <Field label={t('blog.editor.body')} hint={t('blog.editor.bodyHint')}>
                    <Textarea
                        value={form.body_mdx}
                        onChange={(e) => update('body_mdx', e.target.value)}
                        rows={20}
                        className="font-mono text-xs"
                    />
                </Field>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    {form.id && (
                        <Button variant="danger" size="sm" onClick={handleDelete} type="button">
                            {t('blog.editor.delete')}
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {form.status === 'published' && form.id && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void handleUnpublish()}
                            loading={saving}
                        >
                            {t('blog.editor.unpublish')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="secondary"
                        loading={saving}
                    >
                        {t('blog.editor.save')}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void persist('published')}
                        loading={saving}
                    >
                        {t('blog.editor.saveAndPublish')}
                    </Button>
                </div>
            </div>
        </form>
    );
}
