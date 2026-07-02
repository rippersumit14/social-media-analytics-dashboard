import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Notes() {
  return (
    <PlaceholderPage
      eyebrow="Personal Notes"
      title="Notes placeholder"
      description="The notes surface is ready for CRUD screens, pinned notes, archive flows, and content planning in a later milestone."
      readyItems={["Notes route", "Notes endpoint constants", "Scalable feature folder reserved"]}
      nextItems={["Create note form", "Pinned and archived states", "Inline edit workflow"]}
    />
  );
}
