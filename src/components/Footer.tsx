import React from 'react';
import { content } from '../content/types';

export default function Footer(): React.ReactElement {
  const links = content.person.links;
  const validLinks: { label: string; href: string }[] = [];

  if (links.github && links.github.trim() !== '') {
    validLinks.push({ label: 'GitHub', href: links.github });
  }
  if (links.linkedin && links.linkedin.trim() !== '') {
    validLinks.push({ label: 'LinkedIn', href: links.linkedin });
  }
  if (links.email && links.email.trim() !== '') {
    const href = links.email === 'TODO' ? 'TODO' : `mailto:${links.email}`;
    validLinks.push({ label: 'Email', href });
  }
  if (links.resume && links.resume.trim() !== '') {
    validLinks.push({ label: 'Résumé', href: links.resume });
  }

  return (
    <footer className="site-footer">
      <div className="page-container footer-content">
        <div className="footer-links">
          {validLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') || item.href.endsWith('.pdf') ? '_blank' : undefined}
              rel={item.href.startsWith('http') || item.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <p className="footer-note">Built on AWS Amplify. 2026</p>
      </div>
    </footer>
  );
}

