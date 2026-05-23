/**
 * Production-grade AI chat layout shell.
 *
 * Composes:
 * - sidebar
 * - usage panel
 * - messages
 * - uploads
 * - chat input
 *
 * Layout responsibilities only.
 */
const ChatLayout = ({
  /**
   * Sidebar section.
   */
  sidebar,

  /**
   * Usage / metadata section.
   */
  usagePanel,

  /**
   * Messages container.
   */
  messages,

  /**
   * Upload preview section.
   */
  uploadPreview,

  /**
   * Chat input section.
   */
  input,
}) => {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Main Layout */}
      <div className="flex min-h-[650px] flex-col lg:h-[calc(100dvh-180px)] lg:flex-row">
        {/* Sidebar */}
        <aside className="flex-shrink-0 border-b border-gray-100 lg:border-b-0 lg:border-r">
          {sidebar}
        </aside>

        {/* Main Content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Usage / Metadata */}
          {usagePanel && (
            <section className="flex-shrink-0 border-b border-gray-100 bg-white p-5">
              {usagePanel}
            </section>
          )}

          {/* Messages */}
          <section className="min-h-0 flex-1 overflow-hidden p-5">
            {messages}
          </section>

          {/* Upload Preview */}
          {uploadPreview && (
            <section className="max-h-[240px] overflow-y-auto border-t border-gray-100 px-5 pt-4">
              {uploadPreview}
            </section>
          )}

          {/* Input */}
          <section className="flex-shrink-0 border-t border-gray-100 bg-white p-5">
            {input}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;