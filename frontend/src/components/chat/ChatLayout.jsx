import { memo } from "react";

/**
 * -------------------------------------------------------
 * Production-grade AI workspace layout.
 * -------------------------------------------------------
 *
 * Handles:
 * - responsive workspace structure
 * - sidebar orchestration
 * - usage panel layout
 * - message viewport containment
 * - upload preview lifecycle
 * - input synchronization
 *
 * Layout-only component.
 */
const ChatLayout = ({
  /**
   * Sidebar section.
   */
  sidebar,

  /**
   * Usage / metadata panel.
   */
  usagePanel,

  /**
   * Messages viewport.
   */
  messages,

  /**
   * Upload previews.
   */
  uploadPreview,

  /**
   * Chat input.
   */
  input,
}) => {
  return (
    <div
      data-testid="chat-layout"
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      {/* ------------------------------------------------ */}
      {/* Main Workspace */}
      {/* ------------------------------------------------ */}
      <div className="flex min-h-[720px] flex-col lg:h-[calc(100dvh-170px)] lg:flex-row">
        {/* ------------------------------------------------ */}
        {/* Sidebar */}
        {/* ------------------------------------------------ */}
        <aside className="w-full shrink-0 border-b border-gray-200 bg-white lg:w-[320px] lg:border-b-0 lg:border-r">
          <div className="h-full min-h-0 overflow-hidden">
            {sidebar}
          </div>
        </aside>

        {/* ------------------------------------------------ */}
        {/* Main Content */}
        {/* ------------------------------------------------ */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {/* ------------------------------------------------ */}
          {/* Usage Panel */}
          {/* ------------------------------------------------ */}
          {usagePanel && (
            <section className="shrink-0 border-b border-gray-200 bg-white px-5 py-4">
              {usagePanel}
            </section>
          )}

          {/* ------------------------------------------------ */}
          {/* Messages */}
          {/* ------------------------------------------------ */}
          <section className="min-h-0 flex-1 overflow-hidden p-5">
            {messages}
          </section>

          {/* ------------------------------------------------ */}
          {/* Upload Preview */}
          {/* ------------------------------------------------ */}
          {uploadPreview && (
            <section className="max-h-[240px] shrink-0 overflow-y-auto border-t border-gray-100 bg-white px-5 py-4">
              {uploadPreview}
            </section>
          )}

          {/* ------------------------------------------------ */}
          {/* Input */}
          {/* ------------------------------------------------ */}
          {input && (
            <section className="shrink-0 border-t border-gray-200 bg-white p-5">
              {input}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default memo(
  ChatLayout
);