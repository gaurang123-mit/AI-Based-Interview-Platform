import { useState } from "react";
import api from "../../../api/axiosClient";
import RecruiterLayout from "../../../layouts/RecruiterLayout"

function SetPassword({onPasswordChanged}) {
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

    setLoading(true);

    try {
      const response = await api.post("/recruiter/set-password", {
             password:newPassword,
      });

      if(response.status == 200){
         onPasswordChanged();
      }

      setMessage(response.data?.message || "Password updated. Redirecting to login...");
      console.log("Reset password response:", response.data);

    } catch (error) {
       console.log(error)
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