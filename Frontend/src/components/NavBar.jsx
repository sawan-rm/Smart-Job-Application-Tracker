import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate('/');
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between"}}>
        <h3>Job Tracker</h3>
        <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Navbar;