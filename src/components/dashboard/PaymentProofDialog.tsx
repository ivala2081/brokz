/**
 * PaymentProofDialog — customer submits crypto payment proof.
 *
 * Flow:
 *   1. Customer fills form (network, TX hash, amount, optional note + file)
 *   2. If a screenshot was attached, upload to `payment-proofs` bucket
 *      under `<organization_id>/<random>.<ext>`
 *   3. Insert into `payment_submissions` with `status='pending_review'`
 *   4. Close dialog, toast success, trigger parent refresh
 *
 * Validation:
 *   * network required
 *   * tx_hash required + shape-validated against NETWORKS[network]
 *   * amount_paid > 0
 *   * screenshot optional (decision E)
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Field from '../ui/Field';
import { toast } from '../ui/Toast';
import { useAuth } from '../auth/AuthContext';
import {
    NETWORK_CODES,
    NETWORKS,
    isTxHashShapeValid,
    type NetworkCode,
} from '../../lib/payments';

export interface PaymentProofDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    invoiceId: string;
    organizationId: string;
    defaultAmount: number;
    defaultCurrency?: string;
    /** When provided, the network selector is locked to this value. */
    lockedNetwork?: string;
    /** When provided, the amount field is locked to this value. */
    lockedAmount?: number;
    /** When provided, the currency selector is locked to this value. */
    lockedCurrency?: string;
    /** When provided, shows static invoice label instead of a picker. */
    lockedInvoiceId?: string;
}

export default function PaymentProofDialog({
    open,
    onClose,
    onSuccess,
    invoiceId,
    organizationId,
    defaultAmount,
    defaultCurrency = 'USDT',
    lockedNetwork,
    lockedAmount,
    lockedCurrency,
    lockedInvoiceId,
}: PaymentProofDialogProps) {
    const { t } = useTranslation('dashboard');
    const { supabase, user } = useAuth();

    const isNetworkLocked = !!lockedNetwork && NETWORK_CODES.includes(lockedNetwork as NetworkCode);
    const isAmountLocked = lockedAmount !== undefined && lockedAmount > 0;
    const isCurrencyLocked = !!lockedCurrency;

    const [network, setNetwork] = useState<NetworkCode>(
        isNetworkLocked ? (lockedNetwork as NetworkCode) : 'USDT-TRC20',
    );
    const [txHash, setTxHash] = useState('');
    const [amount, setAmount] = useState<string>(
        isAmountLocked ? lockedAmount.toFixed(2) : defaultAmount.toFixed(2),
    );
    const [currency, setCurrency] = useState(isCurrencyLocked ? lockedCurrency! : defaultCurrency);
    const [note, setNote] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const info = useMemo(() => NETWORKS[network], [network]);

    function reset() {
        setNetwork(isNetworkLocked ? (lockedNetwork as NetworkCode) : 'USDT-TRC20');
        setTxHash('');
        setAmount(isAmountLocked ? lockedAmount.toFixed(2) : defaultAmount.toFixed(2));
        setCurrency(isCurrencyLocked ? lockedCurrency! : defaultCurrency);
        setNote('');
        setFile(null);
        setErrors({});
    }

    function validate(): boolean {
        const next: Record<string, string> = {};
        if (!txHash.trim()) next.txHash = t('payment.proof.errors.txHashRequired');
        else if (!isTxHashShapeValid(network, txHash.trim()))
            next.txHash = t('payment.proof.errors.txHashShape');
        const n = Number(amount);
        if (!amount || Number.isNaN(n) || n <= 0)
            next.amount = t('payment.proof.errors.amountInvalid');
        if (file && file.size > 10 * 1024 * 1024)
            next.file = t('payment.proof.errors.fileTooLarge');
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            let storagePath: string | null = null;
            if (file) {
                const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
                storagePath = `${organizationId}/${crypto.randomUUID()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from('payment-proofs')
                    .upload(storagePath, file, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false,
                    });
                if (uploadErr) {
                    toast.error(t('payment.proof.errors.upload'));
                    setSubmitting(false);
                    return;
                }
            }

            const { error: insertErr } = await supabase.from('payment_submissions').insert({
                invoice_id: invoiceId,
                organization_id: organizationId,
                submitted_by: user.id,
                network,
                tx_hash: txHash.trim(),
                amount_paid: Number(amount),
                currency,
                proof_storage_path: storagePath,
                note: note.trim() || null,
            });

            if (insertErr) {
                toast.error(insertErr.message || t('payment.proof.errors.generic'));
                setSubmitting(false);
                return;
            }

            toast.success(t('payment.proof.success'));
            reset();
            onSuccess?.();
            onClose();
        } catch {
            toast.error(t('payment.proof.errors.generic'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => { reset(); onClose(); }}
            title={t('payment.proof.title')}
            size="md"
            footer={null}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-ink-muted">
                    {t('payment.proof.description')}
                </p>

                {lockedInvoiceId && (
                    <p className="text-xs text-ink-muted rounded-md border border-line bg-surface-muted px-3 py-2">
                        {t('payment.proof.invoiceLabel', 'Invoice')}: <span className="font-mono">{lockedInvoiceId}</span>
                    </p>
                )}

                <Field label={t('payment.proof.network')} required>
                    <Select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as NetworkCode)}
                        disabled={isNetworkLocked}
                    >
                        {NETWORK_CODES.map((code) => (
                            <option key={code} value={code}>
                                {NETWORKS[code].label} · {NETWORKS[code].chainLabel}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label={t('payment.proof.txHash')} required error={errors.txHash}>
                    <Input
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder={network.startsWith('USDT-TRC20') ? 'abc123…' : '0x…'}
                        autoComplete="off"
                        className="font-mono text-xs"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('payment.proof.amount')} required error={errors.amount}>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isAmountLocked}
                        />
                    </Field>
                    <Field label={t('payment.proof.currency')}>
                        <Select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={isCurrencyLocked}
                        >
                            <option value="USDT">USDT</option>
                            <option value="USDC">USDC</option>
                        </Select>
                    </Field>
                </div>

                <Field label={t('payment.proof.fileOptional')} error={errors.file}>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-xs text-ink file:mr-3 file:rounded-md file:border file:border-line file:bg-surface-muted file:px-3 file:py-1.5 file:text-xs file:text-ink hover:file:bg-white"
                    />
                </Field>

                <Field label={t('payment.proof.noteOptional')}>
                    <Textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('payment.proof.notePlaceholder')}
                    />
                </Field>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" loading={submitting} disabled={submitting}>
                        {submitting ? t('common.submitting') : t('payment.proof.submit')}
                    </Button>
                </div>

                <p className="text-2xs text-ink-muted leading-relaxed pt-1">
                    <strong className="text-ink">{t('payment.proof.preview.label')}:</strong>{' '}
                    {info.chainLabel} · {NETWORKS[network].assetLabel}
                </p>
            </form>
        </Dialog>
    );
}
