import {
  BarChart3,
  Bot,
  BrainCircuit,
  ClipboardList,
  Gauge,
  History,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const publicNavItems = [
  { label: "Overview", sectionId: "overview" },
  { label: "Problems", sectionId: "problems" },
  { label: "Features", sectionId: "features" },
  { label: "How It Works", sectionId: "workflow" },
  { label: "Tutorial", sectionId: "tutorial" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "FAQ", sectionId: "faq" },
  { label: "Contact", sectionId: "contact" },
];

export const reassuranceItems = [
  "No complicated setup",
  "Creator-friendly explanations",
  "Analytics and planning in one place",
];

export const comparisonColumns = [
  {
    title: "Without CreatorIQ",
    items: [
      "Switching between disconnected screens",
      "Looking at numbers without context",
      "Following generic growth advice",
      "Losing useful ideas in random notes",
      "Making content decisions from memory",
      "Struggling to measure consistency",
    ],
  },
  {
    title: "With CreatorIQ",
    items: [
      "One creator analytics workspace",
      "Historical snapshots and trends",
      "Creator Score and score breakdowns",
      "Personalized AI conversations",
      "Prioritized insights",
      "Organized notes and recommendations",
      "Clearer next-step planning",
    ],
  },
];

export const problems = [
  {
    title: "Scattered creator data",
    description:
      "Performance information is often spread across platform screens, screenshots, spreadsheets and unrelated tools. It becomes difficult to build a consistent picture of growth.",
    icon: BarChart3,
  },
  {
    title: "Numbers without clear action",
    description:
      "Reach, impressions and engagement are useful, but many creators still need help translating those numbers into practical content decisions.",
    icon: Lightbulb,
  },
  {
    title: "Generic growth recommendations",
    description:
      "Most online advice is designed for everyone. It may not reflect a creator's content history, consistency, audience response or current performance.",
    icon: BrainCircuit,
  },
  {
    title: "Disconnected planning",
    description:
      "Ideas, observations and action items are frequently stored across notebooks, phone apps, chat messages and memory, making execution inconsistent.",
    icon: NotebookPen,
  },
  {
    title: "No simple measure of creator health",
    description:
      "Creators may understand individual metrics but still lack a single, understandable view of how their overall account is performing.",
    icon: Gauge,
  },
  {
    title: "No ongoing strategic conversation",
    description:
      "A static report cannot answer follow-up questions. Creators often need an assistant that remembers the conversation and helps them think through decisions.",
    icon: MessageSquareText,
  },
];

export const workflowStages = [
  {
    title: "Data",
    icon: RefreshCw,
    items: ["Connected Instagram account", "Synced media", "Analytics snapshots", "Creator activity"],
  },
  {
    title: "Understanding",
    icon: Gauge,
    items: ["Performance trends", "Creator Score", "Score breakdown", "AI insights"],
  },
  {
    title: "Planning",
    icon: ClipboardList,
    items: ["AI conversations", "Recommendations", "Personal notes", "Pinned priorities"],
  },
  {
    title: "Action",
    icon: TrendingUp,
    items: ["Choose the next topic", "Improve consistency", "Repeat stronger patterns", "Review progress later"],
  },
];

export const features = [
  {
    title: "Unified Creator Analytics",
    description:
      "Review key account metrics, recent snapshots and historical performance from a single dashboard instead of jumping between disconnected reports.",
    label: "Performance in one place",
    icon: BarChart3,
    cta: "View analytics",
    action: "analytics",
  },
  {
    title: "Creator Score",
    description:
      "See a simplified view of creator health through an overall score and supporting breakdowns such as growth, engagement, consistency and content performance.",
    label: "A clearer overall picture",
    icon: Gauge,
    cta: "View Creator Score",
    action: "creatorScore",
  },
  {
    title: "AI Growth Assistant",
    description:
      "Ask questions about your creator strategy, continue previous conversations and receive context-aware explanations based on the available creator data.",
    label: "An ongoing strategy conversation",
    icon: Bot,
    cta: "Start an AI conversation",
    action: "chat",
  },
  {
    title: "Creator Insights",
    description:
      "Generate prioritized observations that highlight meaningful patterns, possible issues and opportunities that deserve attention.",
    label: "Know what matters now",
    icon: BrainCircuit,
    cta: "Open insights",
    action: "insights",
  },
  {
    title: "Personal Strategy Notes",
    description:
      "Capture content ideas, observations and next actions. Pin important notes, archive completed plans and keep creator strategy organized.",
    label: "Turn observations into plans",
    icon: NotebookPen,
    cta: "Organize your strategy",
    action: "notes",
  },
  {
    title: "Recommendations",
    description:
      "Review structured actions designed to help creators improve consistency, content planning, engagement and decision-making.",
    label: "Move from insight to action",
    icon: Sparkles,
  },
  {
    title: "Analytics History",
    description:
      "Compare snapshots over time so changes in followers, activity and engagement become easier to understand.",
    label: "Track change over time",
    icon: History,
    cta: "View analytics",
    action: "analytics",
  },
  {
    title: "Instagram-first Workflow",
    description:
      "The current product focuses on supported Instagram professional account workflows and keeps unsupported platforms out of the promise.",
    label: "Focused integration",
    icon: ShieldCheck,
    cta: "Open Instagram setup",
    action: "instagram",
  },
];

export const tutorialSteps = [
  {
    title: "Create your account",
    description: "Register, verify your email and open the protected CreatorIQ workspace.",
  },
  {
    title: "Connect Instagram",
    description: "Use the official Instagram or Meta authorization flow when account management is enabled.",
  },
  {
    title: "Sync media and snapshots",
    description: "Bring supported account data into CreatorIQ, then create analytics snapshots for review.",
  },
  {
    title: "Review your Creator Score",
    description: "Use the score and breakdown as a quick health check, not as the only source of truth.",
  },
  {
    title: "Generate insights",
    description: "Turn analytics into prioritized observations about growth, engagement, activity and consistency.",
  },
  {
    title: "Plan your next move",
    description: "Ask the AI assistant follow-up questions and save practical actions in personal notes.",
  },
];

export const aiDemoPrompts = [
  {
    label: "Why did engagement change?",
    response:
      "Review the posts that changed most since your last snapshot. If practical tips and concise captions performed better, plan a follow-up post that expands the same topic.",
  },
  {
    label: "What should I post next?",
    response:
      "Use your strongest recent content pattern as the starting point. Turn the highest-performing idea into a carousel, then save the outline in notes.",
  },
  {
    label: "How can I improve consistency?",
    response:
      "Start with a realistic publishing rhythm. Pin a weekly note with two repeatable formats, then compare the next analytics snapshot with your current baseline.",
  },
];

export const pricingPlans = [
  {
    name: "Free",
    description: "For exploring the creator workspace and organizing strategy.",
    price: "$0",
    items: ["Authentication and protected workspace", "Personal notes", "Basic product access"],
  },
  {
    name: "Creator",
    description: "For creators who want analytics, score, insights and AI planning in one workflow.",
    price: "Preview",
    items: ["Instagram analytics workflow", "Creator Score", "AI insights", "AI assistant workspace"],
    highlighted: true,
  },
  {
    name: "Studio",
    description: "For future teams and advanced creator operations.",
    price: "Waitlist",
    items: ["Plan and usage visibility", "Advanced preferences", "Expanded account workflow"],
  },
];

export const faqs = [
  {
    question: "What is CreatorIQ?",
    answer:
      "CreatorIQ is a creator analytics and planning workspace that combines supported Instagram data, analytics snapshots, Creator Score, AI insights, conversations, recommendations and personal notes.",
  },
  {
    question: "Who is CreatorIQ designed for?",
    answer:
      "It is designed for creators who want a clearer way to review performance, understand patterns and organize their next actions without depending only on scattered platform metrics.",
  },
  {
    question: "Which social platform is currently supported?",
    answer:
      "The current product is focused on supported Instagram professional account workflows. Additional platforms should only be mentioned when they are implemented later.",
  },
  {
    question: "Does CreatorIQ store my Instagram password?",
    answer:
      "The product should use the official Instagram or Meta authorization flow. Users should not enter their Instagram password into a custom CreatorIQ form.",
  },
  {
    question: "What is Creator Score?",
    answer:
      "Creator Score is a simplified summary of creator health that may combine areas such as growth, engagement, consistency and content performance. Users should review the breakdown, not only the final number.",
  },
  {
    question: "What can I ask the AI assistant?",
    answer:
      "Creators can ask focused questions about performance, content patterns, consistency, insights and planning. The usefulness of an answer depends on the available data and the clarity of the question.",
  },
  {
    question: "Can I use CreatorIQ without connecting Instagram?",
    answer:
      "Account features such as authentication and personal notes may work independently, but analytics, score calculations and data-based insights may require a successfully connected and synchronized account.",
  },
  {
    question: "Does CreatorIQ guarantee growth?",
    answer:
      "No. CreatorIQ is a decision-support product. It can organize information and provide analysis, but it cannot guarantee followers, engagement, revenue or viral content.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "The current application contains plan and AI usage concepts. The public pricing section is informational while plan details continue to develop.",
  },
  {
    question: "How often is creator data updated?",
    answer:
      "Data availability depends on the implemented synchronization flow and connected account. CreatorIQ should not be treated as real-time unless the backend workflow supports that for the account.",
  },
];

export const showcaseTabs = [
  {
    id: "analytics",
    label: "Analytics",
    title: "Snapshot view",
    details: ["Followers 12.4K", "Engagement +12.4%", "Media synced 186"],
  },
  {
    id: "score",
    label: "Score",
    title: "Creator health",
    details: ["Score 82/100", "Consistency strong", "Growth improving"],
  },
  {
    id: "planning",
    label: "Planning",
    title: "Next actions",
    details: ["Expand best topic", "Pin weekly plan", "Review next snapshot"],
  },
];

export const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Overview", sectionId: "overview" },
      { label: "Features", sectionId: "features" },
      { label: "Analytics", action: "analytics" },
      { label: "Creator Score", action: "creatorScore" },
      { label: "AI Assistant", action: "chat" },
      { label: "Pricing", sectionId: "pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Tutorial", sectionId: "tutorial" },
      { label: "FAQ", sectionId: "faq" },
      { label: "Contact", sectionId: "contact" },
      { label: "Documentation", to: "/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

export const contactCategories = [
  "Product question",
  "Technical support",
  "Feedback",
  "Partnership",
  "Plan or waitlist",
  "Other",
];

export const socialLinks = [
  { label: "Email", href: "mailto:sumit.pandey.lko14@gmail.com" },
];
