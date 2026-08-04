export interface BetaLinks {
  /** Apple TestFlight join link */
  apple?: string
  /** Google Play link - used on Android devices */
  android?: string
  /** Google Play testing opt-in link - used on desktop/web (non-Android) */
  androidWeb?: string
}

export interface PortfolioItem {
  key: string
  technologies: string[]
  bgColor: string
  textColor: string
  bgImage: string
  logo?: string
  logoBg?: string
  url?: string
  betaLinks?: BetaLinks
}

export const portfolioItems: PortfolioItem[] = [
  {
    key: 'chronal',
    technologies: ["iOS", "Android", "Travel", "Trip Planning", "Firebase", "AI"],
    bgColor: "bg-teal-900/30",
    textColor: "text-teal-200",
    bgImage: "/assets/portfolio/chronal.jpg",
    logo: "/assets/logos/chronal.png",
    logoBg: "bg-[#FAFAF8]",
    betaLinks: {
      apple: "https://testflight.apple.com/join/DcKuS3dm",
      android: "https://play.google.com/store/apps/details?id=com.stanimeros.chronal",
      androidWeb: "https://play.google.com/apps/testing/com.stanimeros.chronal"
    }
  },
  {
    key: 'irisdrop',
    technologies: ["SaaS", "Web App", "Print Shops", "File Upload", "Queue", "Admin"],
    bgColor: "bg-cyan-900/30",
    textColor: "text-cyan-200",
    bgImage: "/assets/portfolio/irisdrop.jpg",
    logo: "/assets/logos/irisdrop.png",
    url: "https://irisdrop.web.app"
  },
  {
    key: 'athensMytransfer',
    technologies: ["Landing Page", "Transfers", "Athens", "Tourism", "Bookings", "Transport"],
    bgColor: "bg-sky-900/30",
    textColor: "text-sky-200",
    bgImage: "/assets/portfolio/athens-mytransfer.jpg",
    logo: "/assets/logos/athens-mytransfer.png",
    url: "https://athens-mytransfer.web.app"
  },
  {
    key: 'veridictum',
    technologies: ["Website", "AI", "LLM", "Legal Tech", "Document Analysis", "Automation"],
    bgColor: "bg-indigo-900/30",
    textColor: "text-indigo-200",
    bgImage: "/assets/portfolio/veridictum.jpg",
    url: "https://veridictum.ai/"
  },
  {
    key: 'process',
    technologies: ["Website", "Production Monitoring", "Manufacturing", "Real-time", "Dashboard", "Analytics"],
    bgColor: "bg-amber-900/30",
    textColor: "text-amber-200",
    bgImage: "/assets/portfolio/process.jpg",
    url: "https://process-a7a0f.web.app/"
  },
  {
    key: 'skiGreece',
    technologies: ["Website", "Ski Centers", "Travel", "Winter Sports", "Resort Info", "Maps"],
    bgColor: "bg-slate-900/30",
    textColor: "text-slate-200",
    bgImage: "/assets/portfolio/ski-greece.jpg",
    logo: "/assets/logos/ski-greece.png",
    url: "https://ski-greece.gr/"
  },
  {
    key: 'nikiMargariti',
    technologies: ["Website", "AI", "Chatbot", "Education", "Students", "Academic"],
    bgColor: "bg-violet-900/30",
    textColor: "text-violet-200",
    bgImage: "/assets/portfolio/niki-margariti.jpg",
    url: "https://ai.nikimargariti.gr/chats"
  },
  {
    key: 'fireMessage',
    technologies: ["iOS", "Android", "Mobile App", "Push Notifications", "Monetization"],
    bgColor: "bg-red-900/30",
    textColor: "text-red-200",
    bgImage: "/assets/portfolio/fire-message.jpg",
    logo: "/assets/logos/fire-message.png"
  },
  {
    key: 'tattooHealer',
    technologies: ["Web App", "iOS", "Android", "Push Notifications", "Admin Panel", "Education"],
    bgColor: "bg-purple-900/30",
    textColor: "text-purple-200",
    bgImage: "/assets/portfolio/tattoo-healer.jpg",
    logo: "/assets/logos/tattoo-healer.png",
    url: "https://tattoo-healer.com"
  },
  {
    key: 'transHellas',
    technologies: ["Web App", "Parcel Management", "Admin Panel", "Tracking System", "Logistics", "Germany-Greece"],
    bgColor: "bg-blue-900/30",
    textColor: "text-blue-200",
    bgImage: "/assets/portfolio/trans-hellas.jpg",
    logo: "/assets/logos/trans-hellas.jpg",
    url: "https://thr.topaketo.de"
  },
  {
    key: 'etui',
    technologies: ["Website", "E-commerce", "Luxury Packaging", "Jewelry", "Customization", "B2B"],
    bgColor: "bg-amber-900/30",
    textColor: "text-amber-200",
    bgImage: "/assets/portfolio/etui.jpg",
    logo: "/assets/logos/etui.png",
    logoBg: "bg-[#faf9f7]",
    url: "https://etuicreations.de/"
  },
  {
    key: 'ridefast',
    technologies: ["Web App", "Maps", "Payments", "Bookings", "Real-time", "Taxi & Transfers"],
    bgColor: "bg-gray-900/30",
    textColor: "text-gray-200",
    bgImage: "/assets/portfolio/ridefast.jpg",
    logo: "/assets/logos/ridefast.png"
  },
  {
    key: 'atproPartner',
    technologies: ["iOS", "Android", "Web App", "Push Notifications", "Bookings", "Transport"],
    bgColor: "bg-sky-900/30",
    textColor: "text-sky-200",
    bgImage: "/assets/portfolio/atpro-partner.jpg",
    logo: "/assets/logos/atpro-partner.png"
  },
  {
    key: 'mealAi',
    technologies: ["iOS", "Android", "AI", "Computer Vision", "Mobile App", "Nutrition"],
    bgColor: "bg-blue-900/30",
    textColor: "text-blue-200",
    bgImage: "/assets/portfolio/meal-ai.jpg",
    logo: "/assets/logos/meal-ai.png"
  },
  {
    key: 'near',
    technologies: ["iOS", "Android", "Mobile App", "Maps", "AI", "Privacy-focused"],
    bgColor: "bg-orange-900/30",
    textColor: "text-orange-200",
    bgImage: "/assets/portfolio/near.jpg",
    logo: "/assets/logos/near.png"
  },
  {
    key: 'hedeos',
    technologies: ["iOS", "Android", "Education", "Quizzes", "Mobile App", "Language Learning"],
    bgColor: "bg-yellow-900/30",
    textColor: "text-yellow-200",
    bgImage: "/assets/portfolio/hedeos.jpg",
    logo: "/assets/logos/hedeos.png",
    url: "https://hedeos.gr"
  },
  {
    key: 'ekarotsi',
    technologies: ["Website", "E-commerce", "Supermarket", "Online Ordering", "Delivery", "Inventory"],
    bgColor: "bg-green-900/30",
    textColor: "text-green-200",
    bgImage: "/assets/portfolio/ekarotsi.jpg",
    logo: "/assets/logos/e-karotsi.png",
  }
]
