'use client';
import type { AnchorHTMLAttributes } from 'react';

/** Document navigation also works before hydration and across server-only routes. */
export default function NavigationLink({ onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (props.target && props.target !== '_self') || !props.href || props.href.startsWith('#')) return;
    event.preventDefault();
    window.location.assign(props.href);
  }} />;
}
