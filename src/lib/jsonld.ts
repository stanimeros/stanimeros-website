export const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Pantelis Stanimeros - Software Engineer",
  url: "https://stanimeros.com",
  image: "https://stanimeros.com/images/logo-glass-black.png",
  description: "Freelance software engineer based in Thessaloniki, Greece. Specializing in AI agents, automation, mobile apps, custom dashboards, and optimization systems for businesses.",
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
    "AI Agents & Automation",
    "Mobile App Development",
    "Custom Web Applications",
    "Data Dashboards",
    "Business Optimization Systems",
  ],
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

export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does an AI agent actually work for my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AI agent is a program that handles tasks automatically on your behalf, answering customer questions, processing requests, sending follow-ups, or running internal workflows. You define what it should do, and it runs 24/7 without needing someone to manage it manually. Think of it as a team member that never sleeps and never makes the same mistake twice.",
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
      name: "What kind of problems can you solve with optimization?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any problem where you're trying to find the best arrangement, schedule, or allocation, and doing it manually takes too long or gives poor results. Common examples: employee scheduling with shift constraints, delivery route planning, matching resources to tasks, or deciding the optimal mix of products or services.",
      },
    },
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
      name: "How long does it take to build and deploy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A focused AI agent or automation can be up and running in 1–2 weeks. Custom apps and dashboards typically take 3–6 weeks depending on complexity. Optimization systems vary based on the problem. After the free strategy call, you'll get a clear timeline before committing to anything.",
      },
    },
  ],
}
