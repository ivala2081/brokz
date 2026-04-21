import { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import type { RouteKey } from './routes';
import { useLocalePath } from './useLocale';

type LocalizedLinkProps = Omit<LinkProps, 'to'> & {
  /** Route key from ROUTES map — resolved to the correct locale path at render. */
  to: RouteKey;
  /** Optional :slug replacement for dynamic routes (e.g. blogPost). */
  params?: Record<string, string>;
};

/**
 * Locale-aware replacement for react-router's <Link>. Takes a ROUTES key
 * instead of a raw path — the href is resolved to the currently active
 * locale on every render, so language switches update link targets
 * automatically.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ to, params, ...rest }, ref) => {
    const localePath = useLocalePath();
    let path = localePath(to);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, value);
      }
    }
    return <Link ref={ref} to={path} {...rest} />;
  },
);

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
