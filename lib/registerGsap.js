"use client";

let gsapRef = null;
let scrollTriggerRef = null;
let initPromise = null;

export function initGsap() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (gsapRef) return Promise.resolve({ gsap: gsapRef, ScrollTrigger: scrollTriggerRef });

  if (!initPromise) {
    initPromise = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, scrollTriggerModule]) => {
      gsapRef = gsapModule.gsap;
      scrollTriggerRef = scrollTriggerModule.ScrollTrigger;
      gsapRef.registerPlugin(scrollTriggerRef);
      return { gsap: gsapRef, ScrollTrigger: scrollTriggerRef };
    });
  }

  return initPromise;
}
