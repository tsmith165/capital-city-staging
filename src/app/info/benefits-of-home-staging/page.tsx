import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Benefits of Home Staging | Capital City Staging',
  description:
    'Discover how professional home staging can help sell your property faster and for a higher price. Learn the key benefits with Capital City Staging.',
  keywords:
    'benefits of home staging, home staging advantages, sell home faster, increase home value, Capital City Staging, real estate staging, home staging tips',
  openGraph: {
    title: 'Benefits of Home Staging | Capital City Staging',
    description:
      'Discover how professional home staging can help sell your property faster and for a higher price. Learn the key benefits with Capital City Staging.',
    url: 'https://www.capitalcitystaging.com/info/benefits-of-home-staging',
    images: [
      {
        url: '/favicon/CCS_og_image.png',
        width: 1200,
        height: 630,
        alt: 'Benefits of Home Staging',
      },
    ],
    type: 'article',
    locale: 'en_US',
  },
};

export default function BenefitsOfHomeStaging() {
  return (
    <PageLayout page="benefits-of-home-staging">
      <div className="flex flex-col items-center w-full h-fit py-16 px-8 space-y-8 bg-stone-900">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
          The Benefits of Home Staging
        </h1>
        <div className="flex flex-col space-y-6 max-w-4xl text-stone-300">
          <p className="text-lg">
            Selling a home is a significant undertaking, and first impressions are crucial.
            Professional home staging is a powerful tool that can make your property more
            appealing to potential buyers. At Capital City Staging, we help you showcase your
            home’s best features, ensuring it stands out in the competitive real estate market.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            Key Benefits of Home Staging
          </h2>

          <h3 className="text-xl font-semibold text-stone-100">
            1. Sell Your Home Faster
          </h3>
          <p>
            Staged homes often sell faster than non-staged homes. By creating a welcoming and
            attractive environment, buyers can more easily envision themselves living in the
            space, which can expedite the decision-making process.
          </p>

          <h3 className="text-xl font-semibold text-stone-100">
            2. Increase Your Home's Value
          </h3>
          <p>
            Professionally staged homes can command higher offers. By highlighting your home's
            strengths and minimizing any shortcomings, staging can increase perceived value,
            leading to better sale prices.
          </p>

          <h3 className="text-xl font-semibold text-stone-100">
            3. Stand Out in Listings
          </h3>
          <p>
            In today's digital age, most buyers start their search online. High-quality photos
            of a beautifully staged home can make your listing more attractive, increasing
            traffic and interest.
          </p>

          <h3 className="text-xl font-semibold text-stone-100">
            4. Appeal to a Wider Audience
          </h3>
          <p>
            Home staging helps neutralize your space, making it easier for a diverse range of
            buyers to imagine themselves living there. This broader appeal can lead to more
            offers.
          </p>

          <h3 className="text-xl font-semibold text-stone-100">
            5. Highlight Key Features
          </h3>
          <p>
            A professional stager knows how to draw attention to your home's best features,
            such as architectural details, spacious layouts, or natural lighting, enhancing
            overall appeal.
          </p>

          <h3 className="text-xl font-semibold text-stone-100">
            6. Reduce Stress
          </h3>
          <p>
            Selling a home can be stressful. By entrusting the staging process to professionals,
            you can focus on other aspects of the move, confident that your home is being
            presented at its best.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            Why Choose Capital City Staging?
          </h2>
          <p>
            At Capital City Staging, we bring expertise and passion to every project. Our team
            works closely with you to understand your goals and tailor our services to meet
            your needs. We combine design principles with market insights to create spaces that
            resonate with buyers.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            Get Started Today
          </h2>
          <p>
            Ready to experience the benefits of home staging?{' '}
            <a href="/contact" className="text-secondary hover:underline">
              Contact us
            </a>{' '}
            today to schedule a consultation and take the first step toward selling your home
            faster and for a higher price.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
