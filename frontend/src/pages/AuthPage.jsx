import { ArrowRight, Eye, Lock, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10" data-testid="auth-page-root">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        data-testid="auth-card"
      >
        <div className="p-7 md:p-8">
          <Link to="/" className="inline-flex items-center gap-2" data-testid="auth-logo-link">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">▣</span>
            <span className="font-heading text-4xl font-extrabold tracking-tight text-blue-600" data-testid="auth-logo-text">
              ShopCentral
            </span>
          </Link>

          <h1 className="mt-6 text-4xl font-bold tracking-tight" data-testid="auth-heading">
            Welcome Back
          </h1>
          <p className="mt-2 text-zinc-500" data-testid="auth-subheading">
            Enter your credentials to access your account.
          </p>

          <Tabs defaultValue="login" className="mt-6" data-testid="auth-tabs-root">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl" data-testid="auth-tabs-list">
              <TabsTrigger value="login" data-testid="auth-tab-login">Log In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="auth-tab-signup">Sign Up</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-5 grid grid-cols-2 gap-3" data-testid="auth-social-buttons">
            <Button variant="outline" className="h-11 rounded-xl" data-testid="auth-google-button">
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" data-testid="auth-apple-button">
              Apple
            </Button>
          </div>

          <div className="relative mt-6" data-testid="auth-divider-row">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <span className="relative bg-white pr-2 text-xs uppercase tracking-[0.15em] text-zinc-400">or continue with email</span>
          </div>

          <form className="mt-6 space-y-4" data-testid="auth-form">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700" data-testid="auth-email-label">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input type="email" placeholder="name@example.com" className="h-12 rounded-xl pl-9" data-testid="auth-email-input" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-700" data-testid="auth-password-label">Password</label>
                <button type="button" className="text-sm text-blue-600" data-testid="auth-forgot-password-button">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input type="password" placeholder="••••••••" className="h-12 rounded-xl pl-9 pr-10" data-testid="auth-password-input" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" data-testid="auth-password-visibility-button">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600" data-testid="auth-remember-row">
              <Checkbox data-testid="auth-remember-checkbox" />
              <span data-testid="auth-remember-label">Remember me for 30 days</span>
            </label>

            <Button className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-700" data-testid="auth-signin-button">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-7 py-5 text-center md:px-8">
          <p className="text-sm text-zinc-600" data-testid="auth-switch-account-text">
            Don&apos;t have an account?{" "}
            <button type="button" className="font-semibold text-blue-600" data-testid="auth-signup-free-button">
              Sign up for free
            </button>
          </p>
          <p className="mt-3 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.13em] text-zinc-500" data-testid="auth-security-tags">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure SSL
            </span>
            <span>PCI Compliant</span>
          </p>
        </div>
      </motion.section>
    </main>
  );
}