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
 * Keeps AIChat page extremely clean.
 */
const ChatLayout = ({
  /**
   * Sidebar.
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
   * Chat input.
   */
  input,
}) => {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="flex h-[calc(100vh-180px)] min-h-[720px] flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="border-b border-gray-100 lg:border-b-0 lg:border-r">
          {sidebar}
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Metadata */}
          {usagePanel && (
            <div className="border-b border-gray-100 bg-white p-5">
              {usagePanel}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-hidden p-5">
            {messages}
          </div>

          {/* Upload Preview */}
          {uploadPreview && (
            <div className="border-t border-gray-100 px-5 pt-4">
              {uploadPreview}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 bg-white p-5">
            {input}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;