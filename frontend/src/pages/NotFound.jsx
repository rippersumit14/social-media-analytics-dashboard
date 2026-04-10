import { Link } from "react-router-dom";

/**
 * Fallback page for undefined routes.
 */
const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-3 text-gray-600">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;