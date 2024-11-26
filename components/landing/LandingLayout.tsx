import CallToAction from "./CallToAction";
import Faqs from "./Faqs";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import Introduction from "./Introduction";
import Navbar from "./Navbar";
import LogoTicker from "./Ticker";

export default function LandingLayout() {
  return (
    <>
      <Navbar />
      <Hero />
      <LogoTicker />
      <Introduction />
      <Features />
      <Faqs />
      <CallToAction />
      <Footer />
    </>
  );
}
