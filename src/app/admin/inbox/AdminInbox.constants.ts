import type { InboxFilter } from './AdminInbox.types';

export const INBOX_FILTERS: readonly { value: InboxFilter; label: string }[] = [
    { value: 'unanswered', label: 'Needs reply' },
    { value: 'answered', label: 'Answered' },
    { value: 'all', label: 'All messages' },
] as const;
