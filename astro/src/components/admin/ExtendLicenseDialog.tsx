/**
 * ExtendLicenseDialog — updates `licenses.expires_at` directly via Supabase.
 *
 * RLS grants admin all on licenses, so no Edge Function is needed. Audit
 * trail (audit_log row) will be written by DB trigger in a later migration;
 * until then this is a direct update.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

export interface ExtendLicenseDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    licenseId: string | null;
    currentExpiresAt: string | null;
}

export default function ExtendLicenseDialog({
    open,
    onClose,
    onSuccess,
    licenseId,
    currentExpiresAt,
}: ExtendLicenseDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [expiresAt, setExpiresAt] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (currentExpiresAt) {
            setExpiresAt(currentExpiresAt.slice(0, 10));
        } else {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            setExpiresAt(d.toISOString().slice(0, 10));
        }
    }, [open, currentExpiresAt]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!licenseId) return;
        setSubmitting(true);
        const { error } = await supabase
            .from('licenses')
            .update({ expires_at: new Date(expiresAt).toISOString(), status: 'active' })
            .eq('id', licenseId);
        setSubmitting(false);
        if (error) {
            toast.error(t('licenses.extendDialog.error'));
            return;
        }
        toast.success(t('licenses.extendDialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('licenses.extendDialog.title')}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="extend-license-form" loading={submitting}>
                        {t('licenses.extendDialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="extend-license-form" onSubmit={handleSubmit} className="space-y-4">
                <Field label={t('licenses.extendDialog.expiresAt')} required>
                    <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        required
                    />
                </Field>
            </form>
        </Dialog>
    );
}
