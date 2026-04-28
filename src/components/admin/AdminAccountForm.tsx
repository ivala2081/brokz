/**
 * AdminAccountForm — /admin/account.
 *
 * Mirrors dashboard/AccountForm but for admin users. Lets admins update
 * their own full_name + phone, and change their password. Email is
 * read-only (email change needs re-confirmation via Supabase auth email
 * flow — not exposed in the UI yet).
 *
 * Admin role itself cannot be self-mutated — RLS policy `profiles_self_update`
 * WITH CHECK blocks role column changes, and the form doesn't expose it.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

type Locale = 'en' | 'tr';

const profileSchema = z.object({
    full_name: z.string().min(1),
    phone: z.string().optional(),
});

const passwordSchema = z
    .object({
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        path: ['confirmPassword'],
        message: 'mismatch',
    });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function AdminAccountForm({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey={null}
            title={t('account.title')}
            subtitle={t('account.subtitle')}
        >
            <AccountInner />
        </AdminShell>
    );
}

interface ProfileRow {
    full_name: string | null;
    phone: string | null;
}

function AccountInner() {
    const { t } = useTranslation('admin');
    const { supabase, user, profile } = useAuth();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [, setProfileRow] = useState<ProfileRow | null>(null);

    const {
        register: regProfile,
        handleSubmit: handleProfile,
        reset: resetProfile,
        formState: { errors: profileErrors },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { full_name: '', phone: '' },
    });

    const {
        register: regPassword,
        handleSubmit: handlePassword,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .maybeSingle();
            if (data) {
                const row = data as ProfileRow;
                setProfileRow(row);
                resetProfile({
                    full_name: row.full_name ?? '',
                    phone: row.phone ?? '',
                });
            }
        }
        void load();
    }, [supabase, user.id, resetProfile]);

    async function saveProfile(values: ProfileValues) {
        setProfileLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: values.full_name, phone: values.phone ?? null })
            .eq('id', user.id);
        setProfileLoading(false);
        if (error) {
            toast.error(t('account.profile.error'));
            return;
        }
        toast.success(t('account.profile.success'));
    }

    async function savePassword(values: PasswordValues) {
        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({ password: values.newPassword });
        setPasswordLoading(false);
        if (error) {
            toast.error(t('account.password.error'));
            return;
        }
        toast.success(t('account.password.success'));
        resetPassword();
    }

    const passwordMismatch = passwordErrors.confirmPassword?.message === 'mismatch'
        ? t('account.password.mismatch')
        : passwordErrors.confirmPassword?.message;

    return (
        <div className="space-y-8 max-w-lg">
            <section className="rounded-lg border border-line bg-white p-6 space-y-5">
                <h2 className="text-base font-semibold text-ink">{t('account.profile.title')}</h2>
                <form onSubmit={handleProfile(saveProfile)} className="space-y-4">
                    <Field
                        label={t('account.profile.email')}
                        htmlFor="admin-account-email"
                        hint={t('account.profile.emailHint')}
                    >
                        <Input
                            id="admin-account-email"
                            type="email"
                            value={profile.email ?? user.email ?? ''}
                            readOnly
                            disabled
                        />
                    </Field>

                    <Field
                        label={t('account.profile.fullName')}
                        htmlFor="admin-account-full-name"
                        required
                        error={profileErrors.full_name?.message}
                    >
                        <Input id="admin-account-full-name" {...regProfile('full_name')} />
                    </Field>

                    <Field
                        label={t('account.profile.phone')}
                        htmlFor="admin-account-phone"
                        error={profileErrors.phone?.message}
                    >
                        <Input id="admin-account-phone" type="tel" {...regProfile('phone')} />
                    </Field>

                    <div className="pt-1">
                        <Button type="submit" loading={profileLoading} disabled={profileLoading}>
                            {profileLoading ? t('common.saving') : t('account.profile.save')}
                        </Button>
                    </div>
                </form>
            </section>

            <section className="rounded-lg border border-line bg-white p-6 space-y-5">
                <h2 className="text-base font-semibold text-ink">{t('account.password.title')}</h2>
                <form onSubmit={handlePassword(savePassword)} className="space-y-4">
                    <Field
                        label={t('account.password.new')}
                        htmlFor="admin-account-new-password"
                        required
                        error={
                            passwordErrors.newPassword?.type === 'too_small'
                                ? t('account.password.tooShort')
                                : passwordErrors.newPassword?.message
                        }
                    >
                        <Input
                            id="admin-account-new-password"
                            type="password"
                            autoComplete="new-password"
                            {...regPassword('newPassword')}
                        />
                    </Field>

                    <Field
                        label={t('account.password.confirm')}
                        htmlFor="admin-account-confirm-password"
                        required
                        error={passwordMismatch}
                    >
                        <Input
                            id="admin-account-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            {...regPassword('confirmPassword')}
                        />
                    </Field>

                    <div className="pt-1">
                        <Button type="submit" loading={passwordLoading} disabled={passwordLoading}>
                            {passwordLoading ? t('common.saving') : t('account.password.submit')}
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}
