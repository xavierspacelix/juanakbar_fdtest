import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <Hero />
        <Footer />
      </main>
    </>
  );
}
