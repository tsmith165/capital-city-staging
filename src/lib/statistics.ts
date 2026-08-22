export interface StagingStatistic {
    value: string;
    claim: string;
    source: string;
}

/**
 * The homepage used to shuffle nine of these with `Math.random()` and rotate one into view every
 * five seconds, on a band that was hidden below `md` entirely. Four are shown at once now, so
 * the numbers can be read and compared instead of waiting for the carousel to come back around.
 */
export const statistics: StagingStatistic[] = [
    {
        value: '73%',
        claim: 'less time on the market for staged homes',
        source: 'Real Estate Staging Association',
    },
    {
        value: '6-20%',
        claim: 'higher sale price than comparable unstaged homes',
        source: 'International Association of Home Staging Professionals',
    },
    {
        value: '81%',
        claim: 'of buyers find it easier to picture a staged home as their own',
        source: 'National Association of Exclusive Buyer Agents',
    },
    {
        value: '48%',
        claim: 'of buyers are more likely to tour a staged home they found online',
        source: 'Zillow',
    },
];
