import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const businessUnits = [
      "Global",
      "Spain",
      "Italy",
      "Germany",
      "Latam",
      "United States"
  ];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!businessUnit) {
      setError("Please select a Business Unit");
      return;
    }

    try {
      await Auth.signUp({
        username: email,
        password: password,
        attributes: {
          email: email,
          "custom:business_unit": businessUnit,  // <-- IMPORTANT
        }
      });

      setMessage("Signup successful! Check your email for verification.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSignUp}>

        <h2>Sign up</h2>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <label>Email address</label>
        <input
          type="email"
          placeholder="name@host.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* ----------------------------- */}
        {/*   BUSINESS UNIT DROPDOWN      */}
        {/* ----------------------------- */}
        <label>Business Unit</label>
        <select
          value={businessUnit}
          onChange={(e) => setBusinessUnit(e.target.value)}
          required
        >
          <option value="">Select Business Unit</option>
          {businessUnits.map((bu) => (
            <option key={bu} value={bu}>{bu}</option>
          ))}
        </select>

        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}
