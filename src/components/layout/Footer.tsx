import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

import { SERVICE_AREAS } from './Footer.constants';

const CONTACT_EMAIL = 'mdofflemyer.realestate@gmail.com';
const CONTACT_PHONE = '(209) 817-4240';
const CONTACT_PHONE_HREF = 'tel:+12098174240';

export default function Footer() {
    return (
        <footer className="border-t border-line bg-surface text-body-muted">
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
                        Professional home staging and decorating across the greater Sacramento area, helping homes sell faster and for
                        more.
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 transition-colors hover:text-gold-300">
                            <Mail size={15} aria-hidden="true" />
                            <span className="break-all">{CONTACT_EMAIL}</span>
                        </a>
                        <a href={CONTACT_PHONE_HREF} className="inline-flex items-center gap-2 transition-colors hover:text-gold-300">
                            <Phone size={15} aria-hidden="true" />
                            {CONTACT_PHONE}
                        </a>
                    </div>
                </div>

                <nav aria-label="Footer" className="flex flex-col gap-3">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold-300">Explore</h2>
                    <Link href="/?component=portfolio" className="text-sm transition-colors hover:text-gold-300">
                        Portfolio
                    </Link>
                    <Link href="/services/home-staging" className="text-sm transition-colors hover:text-gold-300">
                        Home staging
                    </Link>
                    <Link href="/services/home-decorating" className="text-sm transition-colors hover:text-gold-300">
                        Home decorating
                    </Link>
                    <Link href="/info" className="text-sm transition-colors hover:text-gold-300">
                        Articles
                    </Link>
                    <Link href="/contact" className="text-sm transition-colors hover:text-gold-300">
                        Get a quote
                    </Link>
                </nav>

                <div className="flex flex-col gap-3">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold-300">Areas we serve</h2>
                    <ul className="flex flex-wrap gap-x-4 gap-y-2">
                        {SERVICE_AREAS.map(({ slug, name }) => (
                            <li key={slug}>
                                <Link href={`/locations/${slug}`} className="text-sm transition-colors hover:text-gold-300">
                                    {name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-line px-5 py-5 text-center text-xs text-body-subtle sm:px-8">
                &copy; {new Date().getFullYear()} Capital City Staging. All rights reserved.
            </div>
        </footer>
    );
}
