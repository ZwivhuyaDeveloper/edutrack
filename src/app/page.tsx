import HeroSection from "@/components/Hero-Section";
import Footer from "@/layout/Footer";
import NavMenu from "@/layout/NavMenu";

export default function Home() {
  return (
    <div className="max-h-screen max-w-screen">
      <NavMenu />
      <HeroSection />
      <Footer />
    </div>
  );
}
