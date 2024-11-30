import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import CallToAction from "./CallToAction";
import Faqs from "./Faqs";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import Introduction from "./Introduction";
import Navbar from "./Navbar";
import LogoTicker from "./Ticker";

export default function LandingLayout({ user }: { user: KindeUser }) {
  return (
    <>
      <Navbar user={user} />
      <Hero user={user} />
      <LogoTicker />
      <Introduction />
      <Features />
      <Faqs />
      <CallToAction user={user} />
      <Footer />
    </>
  );
}
