import { useEffect, useState } from "react";
import type { AppConfig } from "../data/config";
import { getAppConfig } from "../data/config";

export function useAppConfig() {
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    return {
      app: { pageTitle: "Loading...", defaultMessage: "" },
      kids: [],
      lists: [],
      messages: { cheers: [], champMessages: [] },
    };
  });
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await getAppConfig("default");
        setAppConfig(config);
        
        // Update page title dynamically
        if (config.app?.pageTitle) {
          document.title = config.app.pageTitle;
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { appConfig, configLoading };
}

