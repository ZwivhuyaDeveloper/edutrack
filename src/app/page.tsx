import AboutUs from "@/components/About-us";
import DashboardShowcase from "@/components/DashboardShowcase";
import HeroSection from "@/components/Hero-Section";
import Footer from "@/layout/Footer";
import NavMenu from "@/layout/NavMenu";

export default function Home() {
  return (
    <div className="max-h-screen max-w-screen">
      <NavMenu />
      <HeroSection />
      <AboutUs />
      <DashboardShowcase />
      <Footer />
    </div>
  );
}
