// Publication-wide settings. Edit here rather than in layouts.

export const site = {
  name: 'The Research Frontier',
  tagline: 'Exploring Ideas. Questioning Science. Discovering Tomorrow.',
  description:
    'Plain-language articles on artificial intelligence, computing and emerging research — each one clear about what is established, what is interpretation and what is still open.',
  locale: 'en',
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  newsletter: {
    action: import.meta.env.PUBLIC_NEWSLETTER_ACTION || '',
    emailField: import.meta.env.PUBLIC_NEWSLETTER_EMAIL_FIELD || 'email',
    cadence: 'one email a month',
  },
  isProduction: import.meta.env.DEPLOY_ENV === 'production',
  articlesPerPage: 12,
};

// Main navigation. `href` may point at a topic, a content type or a page.
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Science', href: '/topics/' },
  { label: 'Artificial Intelligence', href: '/topics/artificial-intelligence/' },
  { label: 'Research Ideas', href: '/type/research-idea/' },
  { label: 'Questions', href: '/questions/' },
  { label: 'Discoveries', href: '/type/research-discovery/' },
  { label: 'Future & Society', href: '/topics/future-society/' },
  { label: 'About', href: '/about/' },
];

// Social links render only when a URL is filled in.
export const social: { label: string; href: string }[] = [
  // { label: 'Mastodon', href: 'https://…' },
  // { label: 'LinkedIn', href: 'https://…' },
];

export const footerLinks = [
  { label: 'About', href: '/about/' },
  { label: 'Editorial policy', href: '/editorial-policy/' },
  { label: 'Write for us', href: '/submit/' },
  { label: 'Contact & corrections', href: '/contact/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Terms', href: '/terms/' },
  { label: 'Accessibility', href: '/accessibility/' },
  { label: 'RSS feed', href: '/rss.xml' },
];
