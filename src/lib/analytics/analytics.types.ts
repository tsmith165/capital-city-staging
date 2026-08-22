/**
 * Where in the page an interaction happened. Two "Get a quote" buttons that both fire
 * `cta_clicked` are only useful if you can tell them apart afterwards.
 */
export type AnalyticsPlacement =
    | 'nav'
    | 'nav_mobile'
    | 'hero'
    | 'services_card'
    | 'services_footer'
    | 'about'
    | 'article'
    | 'location'
    | 'service_page'
    | 'footer'
    | 'contact_page';

export interface AnalyticsEventMap {
    /** The visitor touched the quote calculator for the first time in this session. */
    quote_started: { placement: AnalyticsPlacement };
    /** A completed quote request. This is the conversion the business runs on. */
    quote_submitted: {
        estimate: number;
        staging_type: 'vacant' | 'occupied';
        square_footage: number;
        bedrooms: number;
        bathrooms: number;
        distance_miles: number;
        outdoor_staging: boolean;
        multi_floor: boolean;
    };
    quote_failed: { reason: 'validation' | 'delivery'; fields?: string[] };
    cta_clicked: { cta: string; placement: AnalyticsPlacement };
    contact_channel_clicked: { channel: 'phone' | 'email'; placement: AnalyticsPlacement };
    portfolio_project_selected: { project: string };
    portfolio_image_opened: { project: string; index: number };
    service_area_selected: { city: string };
    article_opened: { slug: string; placement: AnalyticsPlacement };
}

export type AnalyticsEvent = keyof AnalyticsEventMap;
