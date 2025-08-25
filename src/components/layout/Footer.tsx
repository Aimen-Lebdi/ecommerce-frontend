import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-blue text-white py-10 my-6 rounded-4xl">
      <div className=" mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold mb-3">Subscribe to our Newsletter</h3>
          <p className="text-sm text-white/80 mb-4">
            Stay updated with the latest news and offers.
          </p>
          <form className="flex flex-col  items-start  gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className=" px-4 py-2 rounded-full w-full  "
            />
            <button
              type="submit"
              className="bg-light-blue px-4 py-2 rounded-full text-white font-medium hover:bg-blue"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2 w-fit">
          <h3 className="text-xl font-bold mb-3">Quick Links</h3>
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>

        {/* Social + Payment */}
        <div>
          <h3 className="text-xl font-bold mb-3">Connect with us</h3>
          <div className="flex items-center gap-4 mb-6">
            <a href="#"><Facebook className="hover:text-[#1877f2]" /></a>
            <a href="#"><Twitter className="hover:text-[#1da1f2]" /></a>
            <a href="#"><Instagram className="hover:text-[#c32aa3]" /></a>
            <a href="#"><Youtube className="hover:text-[#FF0000]" /></a>
          </div>

          {/* Payment icons (static for now) */}
          <div className="text-sm text-white/80">
            <p>Accepted Payment Methods</p>
            <div className="flex items-center gap-3 mt-2">
              <img src="/payments/visa.png" alt="Visa" className="h-6" />
              <img src="/payments/mastercard.png" alt="MasterCard" className="h-6" />
              <img src="/payments/paypal.png" alt="PayPal" className="h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-10 text-sm text-white/60">
        &copy; {new Date().getFullYear()} CLICON. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
