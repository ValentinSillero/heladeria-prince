import { BranchesSection } from "@/components/BranchesSection";
import { FlavorMarquee } from "@/components/FlavorMarquee";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InstagramSection } from "@/components/InstagramSection";
import { Overlays } from "@/components/Overlays";
import { Providers } from "@/components/Providers";
import { OrderBuilder } from "@/components/OrderBuilder";
import { BRAND } from "@/config/brand";

export default function Home() {
  return (
    <Providers>
      <a
        href="#pedido"
        className="sr-only z-[100] rounded-full bg-carbon px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al pedido
      </a>
      <Header />
      <main>
        <Hero />
        <FlavorMarquee />
        <OrderBuilder />
        <BranchesSection />
        {BRAND.features.instagramSection && <InstagramSection />}
      </main>
      <Footer />
      <Overlays />
    </Providers>
  );
}
