import AboutUs from "@/components/About-us";
import DashboardShowcase from "@/components/DashboardShowcase";
import HeroSection from "@/components/Hero-Section";
import PricingSection from "@/components/Pricing-Section";
import ContactForm from "@/components/Contact-Form";
import Footer from "@/layout/Footer";
import NavMenu from "@/layout/NavMenu";

export default function Home() {
  return (
    <div className="max-h-screen max-w-screen">
      <NavMenu />
      <HeroSection />
      <AboutUs />
      <DashboardShowcase />
      <PricingSection />
      <ContactForm />
      <Footer />
    </div>
  );
}
