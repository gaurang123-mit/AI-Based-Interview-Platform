import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";
import { useAuthContext } from "../../../context/AuthContext";
import { useRef } from "react";
import { KeyRound , Eye, EyeOff} from "lucide-react";

function SetPassword() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();
  const newPasswordRef = useRef(null);
  const confirmPasswordRef= useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmshowPassword, setShowconfirmPassword] = useState(false);

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  const newPassword = newPasswordRef.current?.value || "";
  const confirmPassword = confirmPasswordRef.current?.value || "";
  const validationError = validatePassword(newPassword);

    if (!validatePassword(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

  if (newPassword !== confirmPassword) {
    setMessage("Passwords do not match.");
    return;
}

  setLoading(true);

  try {
    const response = await api.post("/recruiter/set-password", {
      password: newPassword,
    });

    setAuthUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            passwordChanged: true,
          }
        : currentUser
    );

    toast.success(response.data?.message || "Password updated successfully.");
    navigate("/dashboard", { replace: true });
  } catch (error) {
    setMessage(error.response?.data?.message || "Unable to set password.");
  } finally {
    setLoading(false);
  }
};
  return (
  <main className="relative z-10 mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-8">
    <section
      className="w-full max-w-md rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
      aria-label="Set Password Form"
    >
      <div className="mb-7 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
          RP
        </div>

        <h2 className="text-2xl font-semibold text-white">
          Set Password
        </h2>

        <p className="mt-2 text-center text-sm text-slate-400">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="flex min-h-12 items-center rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
          <input
            ref={newPasswordRef}
            type="password"
            placeholder="Enter New Password"
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            required
          />
        </div>

        <div className="flex min-h-12 items-center rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 text-slate-400 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
          <input
            ref={confirmPasswordRef}
            type="password"
            placeholder="Confirm New Password"
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            required
          />
        </div>

          {message && (
      <>
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {message}
        </p>

        <p className="text-xs text-slate-400">
          
        </p>
      </>
    )}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "SETTING..." : "SET PASSWORD"}
        </button>
      </form>
    </section>
  </main>
);
}

export default SetPassword;
