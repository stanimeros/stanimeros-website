import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

const eventMap = {
  pageView: {
    fbq: "PageView",
    firebase: null, // skip sending to Firebase
  },
  beginCheckout: {
    fbq: "InitiateCheckout",
    firebase: "begin_checkout",
  },
  packageSelected: {
    fbq: "ViewContent",
    firebase: "view_item",
  },
};

declare global { interface Window { fbq: any; } }

export const trackEvent = (
  eventKey: keyof typeof eventMap,
  data?: Record<string, any>
) => {
  const mapping = eventMap[eventKey];

  if (typeof window !== 'undefined' && window.fbq && mapping.fbq) {
    window.fbq('track', mapping.fbq, data);
  }

  if (mapping.firebase) {
    logEvent(analytics, mapping.firebase, data);
  } 
};