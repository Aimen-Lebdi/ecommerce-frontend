import { ShoppingCart, Heart, User } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="my-6 sticky top-0 w-full flex flex-col items-center gap-4 text-white transition-all duration-1000">
      {/* 3. Main Navbar */}
      <div className=" w-full flex flex-col md:flex-row items-center justify-between bg-blue rounded-full px-4 py-4 gap-4 md:gap-0 shadow-sm">
        {/* Logo */}
        <Link to="/" className=" text-xl font-bold text-white">
          🌀 CLICON
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-6 max-w-md">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full bg-white text-secondary rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 ">
          <select className=" p-1 outline-none cursor-pointer">
            <option value="en">🌐 En</option>
            <option value="fr">🇫🇷 Fr</option>
            <option value="ar">🇩🇿 Ar</option>
          </select>

          <ThemeToggle></ThemeToggle>

          <Link to="/#" aria-label="Shopping Cart" className="hover:text-green-400 transition">
            <ShoppingCart size={20} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="hover:text-red-500 transition">
            <Heart size={20} />
          </Link>

          <Link to="/#" aria-label="User" className="hover:text-amber-400 transition">
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* 4. Submenu Links */}
      <div className="w-fit flex items-center gap-4 bg-blue rounded-full text-sm ">
        <Link to="/" className=" hover:bg-light-blue py-4 px-5 rounded-full">
          Home
        </Link>
        <Link to="/shop" className=" hover:bg-light-blue py-4 px-4 rounded-full">
          Shop Now
        </Link>
        <Link to="#" className=" hover:bg-light-blue py-4 px-4 rounded-full">
          Track Order
        </Link>
        <Link to="/compare" className=" hover:bg-light-blue py-4 px-4 rounded-full">
          Compare
        </Link>
        <Link to="#" className=" hover:bg-light-blue py-4 px-4 rounded-full">
          Support
        </Link>
      </div>
    </header>
  );
};

export default Header;
