declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const PIXEL_ID = "718526331177155";

export function initPixel() {
  if (typeof window === "undefined" || window.fbq) return;

  (function (f: any, b: Document, e: string, v: string, n: any, t: HTMLScriptElement, s: Element) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js", undefined, undefined as any, undefined as any);

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}
