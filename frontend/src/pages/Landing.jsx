import { PlaceholderPage } from "../components/common/PlaceholderPage";

export default function Landing() {
  return (
    <PlaceholderPage
      eyebrow="Landing"
      title="Landing page placeholder"
      description="This route exists for the Day 7 landing milestone only; the production homepage is not implemented on Day 1."
      readyItems={["Landing route reserved", "Brand language aligned to product vision"]}
      nextItems={["Hero media", "Public copy", "Conversion-focused calls to action"]}
    />
  );
}
