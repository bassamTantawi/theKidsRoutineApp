"use client";

import type { IntegrationMessage, BlockObjects } from "@botpress/webchat";
import {
  Container,
  Header,
  MessageList,
  Composer,
  useWebchat,
  StylesheetProvider,
  renderers,
} from "@botpress/webchat";
import { BOT_CONFIG, CLIENT_ID } from "../../config/webchat";

// Simple text renderer using default bubble renderer
function TextRenderer(props: BlockObjects["bubble"]) {
  const DefaultBubbleRenderer = renderers.bubble;
  return <DefaultBubbleRenderer {...props} />;
}

interface ChatbotProps {
  className?: string;
  height?: string;
}

export function Chatbot({ className = "", height = "600px" }: ChatbotProps) {
  const { client, messages, isTyping, user, clientState, newConversation } =
    useWebchat({
      clientId: CLIENT_ID,
    });

  const sendMessage = async (payload: IntegrationMessage["payload"]) => {
    if (!client) return;

    try {
      await client.sendMessage(payload);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Show message if CLIENT_ID is not configured
  if (!CLIENT_ID) {
    return (
      <div className={`rounded-2xl bg-amber-50 p-6 text-center ring-1 ring-amber-200 ${className}`}>
        <p className="text-sm font-semibold text-amber-900">
          Chatbot is not configured. Please set NEXT_PUBLIC_WEBCHAT_CLIENT_ID in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden ${className}`} style={{ height }}>
      <Container
        connected={clientState !== "disconnected"}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          defaultOpen={false}
          restartConversation={newConversation}
          disabled={false}
          configuration={{
            botName: BOT_CONFIG.name,
            botAvatar: BOT_CONFIG.avatar,
            botDescription: BOT_CONFIG.description,
          }}
        />
        <MessageList
          botName={BOT_CONFIG.name}
          botDescription={BOT_CONFIG.description}
          isTyping={isTyping}
          showMessageStatus={true}
          showMarquee={true}
          messages={messages}
          sendMessage={sendMessage}
          renderers={{
            bubble: TextRenderer,
          }}
        />
        <Composer
          disableComposer={false}
          isReadOnly={false}
          allowFileUpload={false}
          connected={clientState !== "disconnected"}
          sendMessage={sendMessage}
          composerPlaceholder="Ask a question..."
        />
      </Container>
      <StylesheetProvider
        radius={1.5}
        fontFamily="Inter"
        variant="solid"
        color="#0090FF"
      />
    </div>
  );
}

