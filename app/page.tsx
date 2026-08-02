import Products from "@/components/Products";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Products />
    </main>
  );
}