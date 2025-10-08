import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const DiamondPlusFooter: React.FC = () => {
  const footerSections: FooterSection[] = [
    {
      title: 'Training & Development',
      links: [
        { label: 'Scripts & Live Prospecting', href: '/scripts' },
        { label: 'Challenges', href: '/challenges' },
        { label: 'Workshops', href: '/workshops' },
      ],
    },
    {
      title: 'Business Growth',
      links: [
        { label: 'Monthly Business Audit', href: '/business-audit' },
        { label: 'Action Plan', href: '/action-plan' },
        { label: 'Diamond Stories Podcast', href: '/podcasts' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'Ask Ricky AI', href: '/ask-ai' },
        { label: 'Calendar', href: '/calendar' },
        { label: 'Group Calls', href: '/group-calls' },
      ],
    },
    {
      title: 'Support & Legal',
      links: [
        { label: 'Support', href: '/help' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[var(--eerie-black)] text-[var(--ink-inverse)] py-16 mt-auto">
      <div className="px-6 lg:px-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink-inverse)]/60">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-[var(--ink-inverse)]/80 hover:text-[var(--ink-inverse)] transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-[var(--ink-inverse)]/10 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Image 
              src="/diamondpluglogowhite.svg" 
              alt="Diamond Plus Portal" 
              width={150}
              height={50}
              className="h-auto"
            />
            <p className="text-sm text-[var(--ink-inverse)]/60">
              © {new Date().getFullYear()} Zero To Diamond LLC. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--ink-inverse)]/60">
            <span>Powered by</span>
            <a 
              href="https://breakthruweb.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-[var(--ink-inverse)] hover:text-[var(--brand)] transition-colors"
            >
              Breakthru
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
