import { adminMetadata } from '@/app/admin/admin.metadata';

import CheckInWizardClient from './CheckInWizardClient';

export const metadata = adminMetadata('Check in inventory', 'Bring furniture back from finished jobs.');

export default function InventoryCheckInPage() {
    return <CheckInWizardClient />;
}
