export const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Pantelis Stanimeros - Software Engineer",
  url: "https://stanimeros.com",
  image: "https://stanimeros.com/images/logo-glass-black.png",
  description: "Freelance software engineer based in Thessaloniki, Greece. Specializing in AI automation, mobile apps, custom dashboards, and optimization systems for businesses.",
  founder: {
    "@type": "Person",
    name: "Pantelis Stanimeros",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://github.com/stanimeros",
      "https://www.linkedin.com/in/stanimeros",
    ],
  },
  areaServed: [{ "@type": "Country", name: "Greece" }],
  serviceType: [
    "AI & Automation",
    "Website Development",
    "Mobile App Development",
    "Custom Web Applications",
    "Data Dashboards",
    "Business Optimization Systems",
  ],
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Thessaloniki",
    addressCountry: "GR",
  },
  sameAs: [
    "https://github.com/stanimeros",
    "https://www.linkedin.com/in/stanimeros",
  ],
}

const provider = {
  "@type": "Person",
  name: "Pantelis Stanimeros",
  url: "https://stanimeros.com",
}

export const servicesOfferJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Service",
      position: 1,
      name: "Website & Online Presence",
      description: "Custom domain, landing page design & build, Google Search Console, Google Analytics, and Google Business Profile setup.",
      provider,
      areaServed: "GR",
      offers: {
        "@type": "Offer",
        price: "350",
        priceCurrency: "EUR",
        description: "Starting price, excluding VAT",
      },
    },
    {
      "@type": "Service",
      position: 2,
      name: "Web App",
      description: "Custom web app with real-time dashboard, custom functionality & APIs, database & cloud hosting.",
      provider,
      areaServed: "GR",
      offers: {
        "@type": "Offer",
        price: "950",
        priceCurrency: "EUR",
        description: "Starting price, excluding VAT",
      },
    },
    {
      "@type": "Service",
      position: 3,
      name: "Mobile App",
      description: "Native iOS and Android app with publishing to the App Store and Google Play.",
      provider,
      areaServed: "GR",
      offers: {
        "@type": "Offer",
        price: "1950",
        priceCurrency: "EUR",
        description: "Starting price, excluding VAT",
      },
    },
    {
      "@type": "Service",
      position: 4,
      name: "Maintenance",
      description: "24/7 support line, ongoing updates & refinements, domain renewal, hosting & server management.",
      provider,
      areaServed: "GR",
      offers: {
        "@type": "Offer",
        price: "50",
        priceCurrency: "EUR",
        description: "Basic plan, starting price per month, excluding VAT",
        eligibleDuration: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "MON",
        },
      },
    },
    {
      "@type": "Service",
      position: 5,
      name: "AI, Automation & Optimization",
      description: "Custom AI agents, automation, and optimization systems for scheduling, routing, and resource allocation. Priced per project after a free strategy call.",
      provider,
      areaServed: "GR",
    },
  ],
}

export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are there any hidden fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No hidden fees. All costs are discussed and agreed upfront before any work begins. If your project requires third-party services like cloud hosting or AI API usage, those are explained clearly so you know exactly what you're paying for.",
      },
    },
    {
      "@type": "Question",
      name: "How does payment work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You get a free strategy call and a clear scope and price within 2 hours, so there are no surprises. Getting started requires a deposit to lock in the work, and from there you'll see a working prototype in 3–7 days, so you know it's on track early on.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to build and deploy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You'll see a working prototype in 3–7 days. From there, a finalized, launch-ready project typically takes a few weeks, depending on complexity. After the free strategy call, you'll get a clear timeline before committing to anything.",
      },
    },
    {
      "@type": "Question",
      name: "Do I own the site and code once it's done?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100%. Everything I build is yours: the code, the design, the hosting setup. There's no lock-in, and you're free to move it, extend it, or hand it to another developer whenever you want.",
      },
    },
    {
      "@type": "Question",
      name: "I don't have photos, a logo, or brand colors yet. Is that a problem?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all. Tell me what you have in mind, or show me a site you like, and I'll put together a design direction for you, photos, logo, and colors included if you need them.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need technical knowledge to use what you build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all. Everything is built with the end user in mind, whether that's you, your team, or your customers. You get a simple interface to manage things, and all the technical complexity is handled behind the scenes.",
      },
    },
    {
      "@type": "Question",
      name: "Will my site actually show up on Google?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every site and landing page I build ships SEO-ready: proper meta tags, structured data, and fast load times from day one. That's the foundation Google needs to index and rank you; how fast you climb after that also depends on your content and competition.",
      },
    },
    {
      "@type": "Question",
      name: "How does AI automation actually work for my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI automation handles tasks automatically on your behalf, answering customer questions, processing requests, sending follow-ups, or running internal workflows. You define what it should do, and it runs 24/7 without needing someone to manage it manually. Think of it as a team member that never sleeps and never makes the same mistake twice.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of data do I need to train an AI on my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on what you want the AI to do. For customer support AI, your existing documents, FAQs, or product descriptions are enough. For predictions or recommendations, historical records like past orders, schedules, or outcomes work well. You don't need a huge dataset, even a few hundred records can be a good starting point.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of problems can you solve with optimization?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any problem where you're trying to find the best arrangement, schedule, or allocation, and doing it manually takes too long or gives poor results. Common examples: employee scheduling with shift constraints, delivery route planning, matching resources to tasks, or deciding the optimal mix of products or services.",
      },
    },
  ],
}
