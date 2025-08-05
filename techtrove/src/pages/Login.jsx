import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before new request
  
    try {
      localStorage.removeItem("cartItems"); // ✅ Clear cart on login
  
      const response = await axios.post("https://techtrovelive.onrender.com/api/login", {
        email,
        password,
        role,
      });
  
      const token = response.data.token;

      // ✅ Store everything in sessionStorage (per tab)
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userRole", role);
      sessionStorage.setItem("userName", response.data.userName);

      const decoded = jwtDecode(token);
      sessionStorage.setItem("userId", decoded.userId);

      alert("Login successful!");
      navigate("/"); // Can also redirect based on role here
      window.location.reload();
    } catch (err) {
      if (!err.response) {
        setError("Server is unreachable. Please check backend connection.");
      } else {
        setError(err.response.data.message || "Login failed. Please try again.");
      }
    }
  };
  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="dropdown">
            <label>Select Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="seller">seller</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>  
          <input
          type="email"
          placeholder=" Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        </div>
        <div className="form-group">
  <label>Password</label> 
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <div className="forgot-password">
    <a href="/forgot-password">Forgot Password?</a>
  </div>
</div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
