import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      eyebrow="Settings"
      title="Settings placeholder"
      description="Reserved for account preferences, notification settings, integrations, and security controls."
      readyItems={["Settings route", "Reusable dashboard layout", "Auth layout available"]}
      nextItems={["Password update form", "Notification preferences", "Integration controls"]}
    />
  );
}
