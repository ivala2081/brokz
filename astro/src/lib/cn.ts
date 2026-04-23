/**
 * cn() — tiny className helper.
 *
 * Keeps `clsx` out of the browser bundle for components that only need the
 * join-falsey behaviour. Used across admin UI primitives. Components that
 * need the full clsx API (conditional object keys, arrays of arrays) import
 * `clsx` directly — it's a dep in astro/package.json.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}
