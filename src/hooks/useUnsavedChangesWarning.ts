'use client';

import { useEffect } from 'react';

/**
 * Warns before the browser discards edits that were never sent.
 *
 * Both editors hold a form draft and a tray of uploaded-but-uncommitted photos entirely in the
 * browser. Closing the tab, hitting back, or following a link threw all of it away without a word,
 * which is the same class of loss as a failed save — it just looks like the operator's fault.
 *
 * This covers reloads, tab closes and external navigation. In-app route changes are the router's,
 * and the editors keep their own save state visible for those.
 */
export function useUnsavedChangesWarning(dirty: boolean) {
    useEffect(() => {
        if (!dirty) return;

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);
}
