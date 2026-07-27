"use client";

import NavBar from "@/components/organisms/landing/NavBar/NavBar";
import HeroExperience from "@/components/organisms/landing/HeroExperience/HeroExperience";
import Statement from "@/components/organisms/landing/Statement/Statement";
import Approach from "@/components/organisms/landing/Approach/Approach";
import Services from "@/components/organisms/landing/Services/Services";
import Testimonial from "@/components/organisms/landing/Testimonial/Testimonial";
import CtaSection from "@/components/organisms/landing/CtaSection/CtaSection";
import Footer from "@/components/organisms/landing/Footer/Footer";
import styles from "./page.module.css";

export default function NutricionistaPage() {
  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <HeroExperience />
        <Statement />
        <Approach />
        <Services />
        <Testimonial />
        <CtaSection />
        <Footer />
      </main>
    </>
  );
}
