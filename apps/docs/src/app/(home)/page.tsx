import { Ecosystem } from "@/components/home/ecosystem";
import { Features } from "@/components/home/features";
import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { Runtimes } from "@/components/home/runtimes";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Hero />
      <Features />
      <Ecosystem />
      <Runtimes />
      <Footer />
    </main>
  );
}
