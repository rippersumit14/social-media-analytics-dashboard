import { Bot, Camera, MessageCirclePlus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { routePaths } from "../../../routes/routePaths";

export function EmptyChatState({ hasAccount, hasConversation, onCreateConversation, isCreating }) {
  if (!hasAccount) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-brand-700">
          <Camera aria-hidden="true" size={25} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-ink-950">Connect Instagram to start chatting</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          The AI assistant needs creator context before it can answer performance and planning questions.
        </p>
        <Button as={Link} to={routePaths.instagram} className="mt-5">
          <Camera aria-hidden="true" size={18} />
          Connect Instagram
        </Button>
      </div>
    );
  }

  if (!hasConversation) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-brand-700">
          <MessageCirclePlus aria-hidden="true" size={25} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-ink-950">Start your first AI conversation</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Ask about content ideas, engagement patterns, creator score improvements, or what to post next.
        </p>
        <Button type="button" className="mt-5" onClick={() => onCreateConversation()} disabled={isCreating}>
          <Sparkles aria-hidden="true" size={18} />
          {isCreating ? "Creating..." : "New conversation"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-3 px-4 py-12 sm:grid-cols-3">
      {["What content should I post this week?", "Why did engagement change?", "How do I improve my creator score?"].map((prompt) => (
        <div key={prompt} className="rounded-lg border border-line-200 bg-white p-4 text-sm text-ink-700 shadow-sm">
          <Bot aria-hidden="true" className="mb-3 text-brand-700" size={18} />
          {prompt}
        </div>
      ))}
    </div>
  );
}
