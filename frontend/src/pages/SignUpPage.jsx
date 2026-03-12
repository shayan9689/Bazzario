import { ArrowRight, Lock, Mail, User2 } from "lucide-react";
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

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      toast.success("Account created successfully");
      navigate("/account");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950" data-testid="signup-page-root">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        data-testid="signup-card"
      >
        <div className="p-7 md:p-8">
          <BazzarioLogo to="/" className="justify-center" testIdPrefix="signup-logo" />

          <h1 className="mt-6 text-center text-4xl font-bold tracking-tight" data-testid="signup-heading">
            Create Account
          </h1>
          <p className="mt-2 text-center text-zinc-500" data-testid="signup-subheading">
            Join Bazzario and unlock members-only drops and offers.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3" data-testid="signup-social-buttons">
            <Button variant="outline" className="h-11 rounded-xl" data-testid="signup-google-button" aria-label="Continue with Google">
              <GoogleIcon />
            </Button>
            <Button variant="outline" className="h-11 rounded-xl" data-testid="signup-apple-button" aria-label="Continue with Apple">
              <AppleIcon />
            </Button>
          </div>

          <div className="relative mt-6" data-testid="signup-divider-row">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <span className="relative bg-white pr-2 text-xs uppercase tracking-[0.15em] text-zinc-400 dark:bg-zinc-900">or use email</span>
          </div>

          <form className="mt-6 space-y-4" data-testid="signup-form" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="signup-name-label">
                Full Name
              </label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input required type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Johnson" className="h-12 rounded-xl pl-9" data-testid="signup-name-input" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="signup-email-label">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-12 rounded-xl pl-9" data-testid="signup-email-input" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="signup-password-label">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create strong password" className="h-12 rounded-xl pl-9" data-testid="signup-password-input" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400" data-testid="signup-terms-row">
              <Checkbox required data-testid="signup-terms-checkbox" />
              <span data-testid="signup-terms-label">I agree to Terms of Service and Privacy Policy</span>
            </label>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-700" data-testid="signup-submit-button">
              {loading ? "Creating..." : "Create Account"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-7 py-5 text-center dark:border-zinc-800 dark:bg-zinc-950 md:px-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400" data-testid="signup-switch-account-text">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-blue-600" data-testid="signup-signin-link">
              Sign In
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
  );
}
