import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function CreatorScore() {
  return (
    <PlaceholderPage
      eyebrow="Creator Score"
      title="Creator score placeholder"
      description="A dedicated route for the creator score engine, ready for score cards, history charts, and calculation actions."
      readyItems={["Creator score route", "Score API constants", "Dashboard navigation entry"]}
      nextItems={["Fetch latest score", "Render score history", "Add calculate score action"]}
    />
  );
}
