import { useEffect } from "react";

type NetworkInfo = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInfo;
  mozConnection?: NetworkInfo;
  webkitConnection?: NetworkInfo;
};

const SESSION_KEY = "visit-log-sent";
const VISITOR_KEY = "visitor-id";

const VisitLogger = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection =
      navigatorWithConnection.connection ||
      navigatorWithConnection.mozConnection ||
      navigatorWithConnection.webkitConnection;

    const visitorId =
      window.localStorage.getItem(VISITOR_KEY) || crypto.randomUUID();

    window.localStorage.setItem(VISITOR_KEY, visitorId);
    window.sessionStorage.setItem(SESSION_KEY, "true");

    const payload = {
      visitorId,
      path: window.location.pathname,
      referrer: document.referrer || "direct",
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      locale: navigator.language,
      userAgent: navigator.userAgent,
      network: connection
        ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          }
        : null,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    const sent = navigator.sendBeacon?.("/api/visit-log", blob);
    if (!sent) {
      fetch("/api/visit-log", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        window.sessionStorage.removeItem(SESSION_KEY);
      });
    }
  }, []);

  return null;
};

export default VisitLogger;
