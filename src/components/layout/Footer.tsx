import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

import { SERVICE_AREAS } from './Footer.constants';

const CONTACT_EMAIL = 'mdofflemyer.realestate@gmail.com';
const CONTACT_PHONE = '(209) 817-4240';
const CONTACT_PHONE_HREF = 'tel:+12098174240';

export default function Footer() {
    return (
        <footer className="border-line bg-surface text-body-muted border-t">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1.4fr]">
                <div className="flex flex-col gap-4">
                    <Image
                        src="/logo/CCS_logo_text.png"
                        alt="Capital City Staging"
                        width={247}
                        height={88}
                        className="h-11 w-auto object-contain"
                    />
                    <p className="max-w-xs text-sm leading-relaxed">
                        Professional home staging across the greater Sacramento area, helping homes sell faster and for more.
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="hover:text-gold-300 inline-flex items-center gap-2 transition-colors"
                        >
                            <Mail size={15} aria-hidden="true" />
                            <span className="break-all">{CONTACT_EMAIL}</span>
                        </a>
                        <a href={CONTACT_PHONE_HREF} className="hover:text-gold-300 inline-flex items-center gap-2 transition-colors">
                            <Phone size={15} aria-hidden="true" />
                            {CONTACT_PHONE}
                        </a>
                    </div>
                </div>

                <nav aria-label="Footer" className="flex flex-col gap-3">
                    <h2 className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">Explore</h2>
                    <Link href="/?component=portfolio" className="hover:text-gold-300 text-sm transition-colors">
                        Portfolio
                    </Link>
                    <Link href="/services/home-staging" className="hover:text-gold-300 text-sm transition-colors">
                        Home staging
                    </Link>
                    <Link href="/services/occupied-home-staging" className="hover:text-gold-300 text-sm transition-colors">
                        Occupied staging
                    </Link>
                    <Link href="/info" className="hover:text-gold-300 text-sm transition-colors">
                        Articles
                    </Link>
                    <Link href="/contact" className="hover:text-gold-300 text-sm transition-colors">
                        Get a quote
                    </Link>
                </nav>

                <div className="flex flex-col gap-3">
                    <h2 className="text-gold-300 text-[10px] font-extrabold tracking-[0.14em] uppercase">Areas we serve</h2>
                    <ul className="flex flex-wrap gap-x-4 gap-y-2">
                        {SERVICE_AREAS.map(({ slug, name }) => (
                            <li key={slug}>
                                <Link href={`/locations/${slug}`} className="hover:text-gold-300 text-sm transition-colors">
                                    {name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-line text-body-subtle border-t px-5 py-5 text-center text-xs sm:px-8">
                &copy; {new Date().getFullYear()} Capital City Staging. All rights reserved.
            </div>
        </footer>
    );
}
