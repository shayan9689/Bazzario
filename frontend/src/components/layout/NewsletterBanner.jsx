import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/components/shared/motion";

export default function NewsletterBanner() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="container-shell py-16 md:py-24"
      data-testid="newsletter-banner-section"
    >
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 luxury-shadow md:px-10 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600" data-testid="newsletter-eyebrow">
              Stay ahead of the curve
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl" data-testid="newsletter-heading">
              Join the Bazzario Insider Family
            </h2>
            <p className="mt-2 text-sm text-zinc-600 md:text-base" data-testid="newsletter-description">
              Get first access to premium launches, curated picks, and exclusive weekend deals only for members.
            </p>
          </div>

          <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" data-testid="newsletter-subscribe-form">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-12 rounded-full border-zinc-300"
              data-testid="newsletter-email-input"
            />
            <Button
              type="button"
              className="h-12 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700"
              data-testid="newsletter-subscribe-button"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}