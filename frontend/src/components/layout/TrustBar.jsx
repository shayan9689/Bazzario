import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { trustPillars } from "@/data/storeData";
import { fadeUp, staggerParent } from "@/components/shared/motion";

const iconMap = {
  "fast-shipping": Truck,
  "secure-payments": ShieldCheck,
  "easy-returns": RotateCcw,
  "premium-support": Headphones,
};

export default function TrustBar() {
  return (
    <section className="border-y border-zinc-200 bg-white" data-testid="trust-bar-section">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="container-shell grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        {trustPillars.map((pillar) => {
          const Icon = iconMap[pillar.id];
          return (
            <motion.article key={pillar.id} variants={fadeUp} className="flex items-start gap-3" data-testid={`trust-item-${pillar.id}`}>
              <span className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600" data-testid={`trust-item-icon-${pillar.id}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900" data-testid={`trust-item-title-${pillar.id}`}>
                  {pillar.title}
                </h3>
                <p className="text-sm text-zinc-600" data-testid={`trust-item-subtitle-${pillar.id}`}>
                  {pillar.subtitle}
                </p>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}