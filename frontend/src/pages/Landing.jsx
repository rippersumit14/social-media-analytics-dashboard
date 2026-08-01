import { BackToTopButton } from "../components/landing/BackToTopButton";
import { LandingSections } from "../components/landing/LandingSections";
import { PublicNavbar } from "../components/landing/PublicNavbar";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main>
        <LandingSections isAuthenticated={isAuthenticated} />
      </main>
      <BackToTopButton />
    </div>
  );
}
