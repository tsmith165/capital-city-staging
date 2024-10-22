import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Home Staging Tips and Tricks | Capital City Staging',
  description:
    'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
  keywords:
    'home staging tips, staging tricks, sell home faster, increase home value, DIY staging, Capital City Staging, real estate advice',
  openGraph: {
    title: 'Home Staging Tips and Tricks | Capital City Staging',
    description:
      'Discover expert tips and tricks for staging your home to sell faster and for a higher price. Learn from the professionals at Capital City Staging.',
    url: 'https://www.capitalcitystaging.com/info/home-staging-tips',
    images: [
      {
        url: '/favicon/CCS_og_image.png',
        width: 1200,
        height: 630,
        alt: 'Home Staging Tips and Tricks',
      },
    ],
    type: 'article',
    locale: 'en_US',
  },
};

export default function HomeStagingTips() {
  return (
    <PageLayout page="home-staging-tips">
      <div className="flex flex-col items-center w-full h-full py-16 px-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text gradient-gold-main">
          Home Staging Tips and Tricks
        </h1>
        <Image
          src="/images/home-staging-tips.jpg"
          alt="Expert home staging tips"
          width={1200}
          height={630}
          className="rounded-lg shadow-lg"
        />
        <div className="flex flex-col space-y-6 max-w-4xl text-stone-300">
          <p className="text-lg">
            Preparing your home for sale can be a daunting task. At Capital City Staging, we've compiled a list of expert tips and tricks to help you stage your home effectively and attract potential buyers.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            1. Declutter Your Space
          </h2>
          <p>
            Remove unnecessary items to create a sense of space. A clutter-free home appears larger and allows buyers to focus on the property's features.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            2. Depersonalize the Home
          </h2>
          <p>
            Take down personal photographs and mementos. This helps buyers envision themselves living in the space, which can increase their emotional connection to the property.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            3. Make Minor Repairs
          </h2>
          <p>
            Fix leaky faucets, squeaky doors, and chipped paint. Small repairs can significantly improve the overall impression of your home.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            4. Enhance Curb Appeal
          </h2>
          <p>
            First impressions matter. Mow the lawn, trim hedges, and consider adding potted plants near the entrance to make your home inviting from the outside.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            5. Optimize Lighting
          </h2>
          <p>
            Open curtains and blinds to let in natural light. Ensure all bulbs are working and consider using higher wattage bulbs to brighten rooms.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            6. Neutralize Color Schemes
          </h2>
          <p>
            Use neutral colors for walls and décor to appeal to a broader range of buyers. Neutral tones create a blank canvas for buyers to imagine their own style.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            7. Arrange Furniture Strategically
          </h2>
          <p>
            Position furniture to highlight the flow of the room and create cozy conversation areas. Avoid blocking windows or natural pathways.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            8. Keep It Clean
          </h2>
          <p>
            A spotless home signals to buyers that the property has been well-maintained. Pay attention to details like clean windows, dust-free surfaces, and fresh-smelling air.
          </p>

          <h2 className="text-2xl font-semibold text-stone-100">
            Need Professional Help?
          </h2>
          <p>
            While these tips can get you started, professional home staging can take your property to the next level.{' '}
            <a href="/contact" className="text-secondary hover:underline">
              Contact us
            </a>{' '}
            at Capital City Staging to learn how we can help you sell your home faster and for a higher price.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}