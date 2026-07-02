import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Analytics() {
  return (
    <PlaceholderPage
      eyebrow="Analytics"
      title="Analytics dashboard placeholder"
      description="This route is ready for Instagram snapshots, Recharts visualizations, loading states, and empty states in the analytics milestone."
      readyItems={["Protected dashboard shell", "Analytics route", "Recharts dependency installed", "Backend endpoint constants mapped"]}
      nextItems={["Fetch latest snapshot", "Render performance charts", "Add history filters"]}
    />
  );
}
