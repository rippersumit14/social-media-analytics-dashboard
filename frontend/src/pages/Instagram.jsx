import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Instagram() {
  return (
    <PlaceholderPage
      eyebrow="Instagram"
      title="Instagram connection placeholder"
      description="A future OAuth and account status page for connecting Meta accounts and syncing creator media."
      readyItems={["Instagram route", "OAuth endpoint constants", "Media sync endpoint constant"]}
      nextItems={["Connect account CTA", "OAuth callback handling", "Sync status display"]}
    />
  );
}
