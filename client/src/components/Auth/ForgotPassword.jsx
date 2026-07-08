import { useState } from "react";
import api, { getErrorMessage } from "../../api/axiosClient";

function ForgotPassword({ onBackToLogin, onOtpVerified, userEmail }) {
  const [step, setStep] = useState("send-otp");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email: userEmail });
      setMessage("OTP sent to your registered email.");
      setStep("otp");
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email: userEmail,
        otp: otp.toString(),
      });
      setMessage(response.data?.message || "OTP verified.");
      onOtpVerified(userEmail, otp);
    } catch (error) {
      setMessage(getErrorMessage(error, "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
  <main className="relative z-10 mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-8">
    <section
      className="w-full max-w-md rounded-lg border border-slate-500/25 bg-slate-900/90 p-7 text-white shadow-2xl shadow-black/30 backdrop-blur"
      aria-label="Forgot Password Form"
    >
      <div className="mb-7 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
          FP
        </div>

        <h2 className="text-2xl font-semibold text-white">
          Forgot Password
        </h2>
      </div>

      {step === "send-otp" && (
        <div className="grid gap-5">
          {message && (
            <p className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "SENDING..." : "SEND OTP TO EMAIL"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="grid gap-5">
          <div className="flex min-h-12 items-center rounded-lg border border-slate-500/30 bg-slate-950/50 px-3 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/10">
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          {message && (
            <p className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="flex min-h-12 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "VERIFYING..." : "VERIFY OTP"}
          </button>

          <button
            type="button"
            className="text-center text-sm font-semibold text-teal-300 transition hover:text-teal-200"
            onClick={() => setStep("send-otp")}
          >
            Resend OTP
          </button>
        </form>
      )}

      <button
        type="button"
        className="mt-6 w-full text-center text-sm font-semibold text-slate-400 transition hover:text-teal-300"
        onClick={onBackToLogin}
      >
        Back to Login
      </button>
    </section>
  </main>
);
}

export default ForgotPassword;