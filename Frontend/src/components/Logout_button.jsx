import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";


const LogoutButton = () => {
    const navigate = useNavigate();

    const handelLogout = () => {
        logout();
        navigate("/Login");
    };
    return <button onClick={handelLogout}> Logout</button>
};

export default LogoutButton;