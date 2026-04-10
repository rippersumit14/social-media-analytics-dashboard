/**
 * Top navigation bar for dashboard pages.
 */
const Navbar = () => {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="text-xl font-bold text-gray-800">
        Social Media Analytics
      </h1>

      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;