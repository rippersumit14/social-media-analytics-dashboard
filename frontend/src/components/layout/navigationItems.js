import {
  BarChart3,
  Bot,
  BrainCircuit,
  Camera,
  Gauge,
  Home,
  Lightbulb,
  Newspaper,
  NotebookPen,
  Settings,
  UserCircle,
} from "lucide-react";

import { routePaths } from "../../routes/routePaths";

export const navigationItems = [
  { label: "Dashboard", path: routePaths.dashboard, icon: Home },
  { label: "AI Chat", path: routePaths.chat, icon: Bot },
  { label: "Analytics", path: routePaths.analytics, icon: BarChart3 },
  { label: "Creator Score", path: routePaths.creatorScore, icon: Gauge },
  { label: "Creator News", path: routePaths.creatorNews, icon: Newspaper },
  { label: "Insights", path: routePaths.insights, icon: BrainCircuit },
  { label: "Recommendations", path: routePaths.recommendations, icon: Lightbulb },
  { label: "Notes", path: routePaths.notes, icon: NotebookPen },
  { label: "Instagram", path: routePaths.instagram, icon: Camera },
  { label: "Settings", path: routePaths.settings, icon: Settings },
  { label: "Profile", path: routePaths.profile, icon: UserCircle },
];
