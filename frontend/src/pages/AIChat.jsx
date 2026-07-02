import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function AIChat() {
  return (
    <PlaceholderPage
      eyebrow="AI Chat"
      title="AI assistant placeholder"
      description="The chat route is reserved for conversation lists, SSE streaming responses, uploads, and memory-aware prompts in a later milestone."
      readyItems={["AI chat route", "Layout area for conversation UI", "Toast provider", "Query client provider"]}
      nextItems={["Build conversation sidebar", "Connect streaming chat endpoint", "Add upload previews"]}
    />
  );
}
