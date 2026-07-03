import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";
import { useAuthContext } from "../../../context/AuthContext";

function SetPassword() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/recruiter/set-password", {
             password:newPassword,
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
    <div className="login-container">
      <div className="login-card reset-card">
        <div className="profile-icon">RP</div>

        <h2>set Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="form-message">{message}</p>}

          <button type="submit" className="login-btn">
            {loading ? "SETTING..." : "SET PASSWORD"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default SetPassword;
