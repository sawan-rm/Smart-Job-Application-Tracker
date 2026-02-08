import { useState } from "react";
import api from "../Api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // localStorage.clear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔥 AUTO LOGOUT WHEN LOGIN PAGE LOADS
  // useEffect(() => {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("refreshToken");
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      //  THIS LINE IS CRITICAL
      const { accessToken, refreshToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("Saved access token:", localStorage.getItem("accessToken"));

      navigate("/jobs");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
