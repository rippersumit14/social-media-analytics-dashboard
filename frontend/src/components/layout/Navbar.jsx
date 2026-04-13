import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Top navbar for protected pages.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Social Media Analytics
        </h1>
        {user && (
          <p className="text-sm text-gray-500">
            Welcome, {user.name}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;