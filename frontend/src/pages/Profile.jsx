import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Profile() {
  return (
    <PlaceholderPage
      eyebrow="Profile"
      title="Profile placeholder"
      description="A future profile route for creator identity, connected accounts, and workspace-level account details."
      readyItems={["Profile route", "Current user endpoint mapped", "Navigation entry"]}
      nextItems={["Load current user", "Edit profile details", "Show connected Instagram account"]}
    />
  );
}
