export const BOT_CONFIG = {
  name: "Kids Routine Assistant",
  avatar: "", // Optional: Add your bot avatar URL
  description: "Your AI assistant for managing routines and calendar events.",
} as const;

// Get this from your Botpress workspace after running `adk deploy`
// Go to: Botpress Dashboard > Your Bot > Webchat > Client ID
// Set NEXT_PUBLIC_WEBCHAT_CLIENT_ID in your .env.local file
export const CLIENT_ID = process.env.NEXT_PUBLIC_WEBCHAT_CLIENT_ID || "";

