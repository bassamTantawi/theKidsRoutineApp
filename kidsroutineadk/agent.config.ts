import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "kidsroutineadk",
  description: "An AI agent built with Botpress ADK",

  defaultModels: {
    autonomous: "openai:gpt-4o-mini",
    zai: "openai:gpt-4o-mini",
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      webchat: {
        version: "webchat@latest",
        enabled: true,
      },
      openai: {
        version: "openai@latest",
        enabled: true,
      },
    },
  },
});
