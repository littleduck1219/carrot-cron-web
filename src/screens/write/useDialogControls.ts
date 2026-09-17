import { useEffect, type RefObject } from "react";

/** Keep keyboard navigation inside the topmost sheet and restore its opener. */
export function useDialogControls(ref: RefObject<HTMLElement | null>, active: boolean, close: () => void) {
    useEffect(() => {
        if (!active || !ref.current) return;
        const dialog = ref.current;
        const opener = document.activeElement as HTMLElement | null;
        const focusable = () => [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')]
            .filter((element) => element.tabIndex >= 0 && !element.closest('[inert], [hidden]') && element.getClientRects().length > 0);
        (focusable()[0] ?? dialog).focus({ preventScroll: true });
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
            if (event.key !== 'Tab') return;
            const items = focusable();
            const index = items.indexOf(document.activeElement as HTMLElement);
            if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1)?.focus(); }
            else if (!event.shiftKey && (index === items.length - 1 || index === -1)) { event.preventDefault(); items[0]?.focus(); }
        };
        dialog.addEventListener('keydown', onKey);
        return () => { dialog.removeEventListener('keydown', onKey); if (opener?.isConnected) opener.focus({ preventScroll: true }); };
    }, [ref, active, close]);
}
