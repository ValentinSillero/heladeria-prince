"use client";

import { domMax, LazyMotion, MotionConfig } from "motion/react";
import { OrderProvider } from "@/lib/order-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 420, damping: 34 }}>
        <OrderProvider>{children}</OrderProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
