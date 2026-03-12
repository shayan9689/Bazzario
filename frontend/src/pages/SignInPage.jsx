import { ArrowRight, Eye, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import BazzarioLogo from "@/components/branding/BazzarioLogo";
import { AppleIcon, GoogleIcon } from "@/components/auth/SocialIcons";
import { useStore } from "@/context/StoreContext";

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Signed in successfully");
      navigate("/account");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950" data-testid="signin-page-root">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        data-testid="signin-card"
      >
        <div className="p-7 md:p-8">
          <BazzarioLogo to="/" className="justify-center" testIdPrefix="signin-logo" />

          <h1 className="mt-6 text-center text-4xl font-bold tracking-tight" data-testid="signin-heading">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-zinc-500" data-testid="signin-subheading">
            Sign in to continue your premium shopping journey.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3" data-testid="signin-social-buttons">
            <Button variant="outline" className="h-11 rounded-xl" data-testid="signin-google-button" aria-label="Continue with Google">
              <GoogleIcon />
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" data-testid="signin-apple-button" aria-label="Continue with Apple">
              <AppleIcon />
            </Button>
          </div>

          <div className="relative mt-6" data-testid="signin-divider-row">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <span className="relative bg-white pr-2 text-xs uppercase tracking-[0.15em] text-zinc-400 dark:bg-zinc-900">or continue with email</span>
          </div>

          <form className="mt-6 space-y-4" data-testid="signin-form" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="signin-email-label">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-12 rounded-xl pl-9" data-testid="signin-email-input" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="signin-password-label">
                  Password
                </label>
                <button type="button" className="text-sm text-blue-600" data-testid="signin-forgot-password-button">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-12 rounded-xl pl-9 pr-10" data-testid="signin-password-input" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" data-testid="signin-password-visibility-button">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600" data-testid="signin-remember-row">
              <Checkbox data-testid="signin-remember-checkbox" />
              <span data-testid="signin-remember-label">Remember me for 30 days</span>
            </label>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-700" data-testid="signin-submit-button">
              {loading ? "Signing In..." : "Sign In"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-7 py-5 text-center dark:border-zinc-800 dark:bg-zinc-950 md:px-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400" data-testid="signin-switch-account-text">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-600" data-testid="signin-create-account-link">
              Create one
            </Link>
          </p>
          <p className="mt-3 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.13em] text-zinc-500" data-testid="signin-security-tags">
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
