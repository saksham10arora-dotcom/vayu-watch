import { Satellite } from "lucide-react";
import { Link, useLocation } from "react-router-dom"; // Add these imports

const Header = () => {
  const location = useLocation();
  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Delhi Watch", href: "/delhi" },
    { label: "Live Map", href: "/map" },
    { label: "Forecast", href: "/forecast" },
    { label: "Alerts", href: "/alerts" },
    { label: "About", href: "/about" },
    { label: "Profile", href: "/profile" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/95 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Satellite className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Vayu Watch</h1>
                <p className="text-xs text-blue-300">Delhi Air Quality & Public Health</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center justify-center gap-2 rounded-md px-3 h-9 text-sm font-medium transition-colors hover:text-white hover:bg-gray-800 ${
                  location.pathname === item.href ? "text-white bg-gray-800" : "text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;