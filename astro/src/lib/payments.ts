/**
 * Brokz crypto payment constants + helpers.
 *
 * Single source of truth for supported networks, explorer URLs, tolerance
 * thresholds, etc. If you change these, update them here and nowhere else.
 */

export type NetworkCode =
    | 'USDT-TRC20'
    | 'USDT-ERC20'
    | 'USDT-BEP20'
    | 'USDC-ERC20';

export interface NetworkInfo {
    code: NetworkCode;
    label: string;           // "USDT-TRC20"
    chainLabel: string;      // "Tron (TRC-20)"
    assetLabel: string;      // "USDT"
    explorerTxUrl: (txHash: string) => string;
    addressPattern: RegExp;  // rough syntactic validation
    txHashPattern: RegExp;
}

export const NETWORKS: Record<NetworkCode, NetworkInfo> = {
    'USDT-TRC20': {
        code: 'USDT-TRC20',
        label: 'USDT-TRC20',
        chainLabel: 'Tron (TRC-20)',
        assetLabel: 'USDT',
        explorerTxUrl: (h) => `https://tronscan.org/#/transaction/${h}`,
        addressPattern: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
        txHashPattern: /^[a-fA-F0-9]{64}$/,
    },
    'USDT-ERC20': {
        code: 'USDT-ERC20',
        label: 'USDT-ERC20',
        chainLabel: 'Ethereum (ERC-20)',
        assetLabel: 'USDT',
        explorerTxUrl: (h) => `https://etherscan.io/tx/${h}`,
        addressPattern: /^0x[a-fA-F0-9]{40}$/,
        txHashPattern: /^0x[a-fA-F0-9]{64}$/,
    },
    'USDT-BEP20': {
        code: 'USDT-BEP20',
        label: 'USDT-BEP20',
        chainLabel: 'BNB Smart Chain (BEP-20)',
        assetLabel: 'USDT',
        explorerTxUrl: (h) => `https://bscscan.com/tx/${h}`,
        addressPattern: /^0x[a-fA-F0-9]{40}$/,
        txHashPattern: /^0x[a-fA-F0-9]{64}$/,
    },
    'USDC-ERC20': {
        code: 'USDC-ERC20',
        label: 'USDC-ERC20',
        chainLabel: 'Ethereum (ERC-20)',
        assetLabel: 'USDC',
        explorerTxUrl: (h) => `https://etherscan.io/tx/${h}`,
        addressPattern: /^0x[a-fA-F0-9]{40}$/,
        txHashPattern: /^0x[a-fA-F0-9]{64}$/,
    },
};

export const NETWORK_CODES: NetworkCode[] = Object.keys(NETWORKS) as NetworkCode[];

/**
 * Tolerance for a "close enough" payment vs invoice amount.
 * Decision (2026-04-23): flat $5 USD tolerance across all networks — covers
 * gas/fee-eaten sends. Partial payments are NOT accepted; see `D)` decision.
 */
export const PAYMENT_AMOUNT_TOLERANCE_USD = 5;

/**
 * Grace period defaults (decision D):
 *   due_at + 3 days   → soft reminder period, still "sent"
 *   due_at + 10 days  → license auto-suspends (not deleted)
 *   admin mark-paid at any time reactivates license.
 */
export const GRACE_TOLERANCE_DAYS = 3;
export const GRACE_SUSPEND_DAYS = 7;   // tolerance days + 7 = 10 total

/**
 * Format a crypto amount for display.
 * 1 USDT/USDC ≈ 1 USD, display with 2 decimals for invoices.
 */
export function formatCryptoAmount(amount: number, currency: string): string {
    return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Mask a wallet address for display: keep prefix + last 6.
 *   T9zYx1a2b3cDEF… → "T9zYx1…aBcDeF"
 */
export function maskAddress(address: string): string {
    if (!address || address.length < 14) return address ?? '';
    return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

/**
 * Quickly validate whether a TX hash looks syntactically right for a network.
 * Not authoritative — real check happens in the explorer link.
 */
export function isTxHashShapeValid(network: NetworkCode, hash: string): boolean {
    const info = NETWORKS[network];
    if (!info) return false;
    return info.txHashPattern.test(hash.trim());
}
