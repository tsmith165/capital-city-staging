import { AdminPanel } from '@/components/admin/AdminPrimitives';
import { SkeletonBarRows, SkeletonMetricGrid } from '@/components/admin/AdminSkeleton';

/**
 * Stands in for `AnalyticsTraffic` while the PostHog queries run. The panel headers are real, so
 * the page reads as itself rather than as a grey wireframe, and nothing moves when data lands.
 */
export default function AnalyticsTrafficSkeleton() {
    return (
        <>
            <SkeletonMetricGrid count={4} columns={4} label="Loading conversion figures" />
            <SkeletonMetricGrid count={3} columns={3} label="Loading traffic figures" />

            <div className="grid gap-5 xl:grid-cols-2">
                <AdminPanel eyebrow="Content" title="Most viewed pages">
                    <SkeletonBarRows rows={5} label="Loading most viewed pages" />
                </AdminPanel>
                <AdminPanel eyebrow="Acquisition" title="Where visitors come from">
                    <SkeletonBarRows rows={5} label="Loading traffic sources" />
                </AdminPanel>
                <AdminPanel eyebrow="Conversion" title="Which buttons get pressed">
                    <SkeletonBarRows rows={4} label="Loading call-to-action clicks" />
                </AdminPanel>
            </div>

            <AdminPanel eyebrow="Trend" title="Views over time">
                <SkeletonBarRows rows={6} label="Loading the traffic trend" />
            </AdminPanel>
        </>
    );
}
