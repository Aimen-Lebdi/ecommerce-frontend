import { X } from "lucide-react";
// import { useState } from "react";
import clsx from "clsx";

type QuickViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // product: Product;
};

const QuickViewModal = ({ isOpen, onClose }: QuickViewModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-11/12 max-w-6xl bg-white dark:bg-secondary rounded-lg shadow-lg overflow-hidden flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 hover:text-red-500"
        >
          <X size={24} />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-1/2 p-6 flex flex-col items-center">
          {/* Main Image */}
          <img
            src={''} alt={'hi'}
            className="rounded-lg object-cover w-full"
          />
          {/* Thumbnails */}
          <div className="flex gap-2 mt-4">
            {["mac1.jpg", "mac2.jpg", "mac3.jpg"].map((img, i) => (
              <img
                key={i}
                src={`/assets/${img}`}
                alt={`thumb-${i}`}
                className={clsx(
                  "w-16 h-16 rounded border cursor-pointer object-cover",
                  i === 0 && "border-blue-500 ring-2 ring-blue-500"
                )}
              />
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
            2020 Apple MacBook Pro with Apple M1 Chip (13", 8GB, 256GB)
          </h2>
          <p className="text-sm text-green-500">In Stock</p>

          <div className="my-2 text-lg font-bold text-blue-600">
            $1699 <span className="line-through text-gray-400 ml-2">$1999</span>{" "}
            <span className="ml-2 text-sm text-white bg-yellow-500 px-2 py-0.5 rounded">
              21% OFF
            </span>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4 my-4">
            <select className="w-full border px-2 py-1 rounded">Color</select>
            <select className="w-full border px-2 py-1 rounded">Size</select>
            <select className="w-full border px-2 py-1 rounded">Memory</select>
            <select className="w-full border px-2 py-1 rounded">Storage</select>
          </div>

          {/* Quantity & Buttons */}
          <div className="flex items-center gap-2 mb-4">
            <button className="bg-gray-300 px-2 py-1 rounded">-</button>
            <span>1</span>
            <button className="bg-gray-300 px-2 py-1 rounded">+</button>
          </div>

          <div className="flex gap-4 mb-4">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">
              Add to Cart
            </button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded">
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-4 flex gap-2">
            <img src="/assets/visa.svg" className="h-6" alt="Visa" />
            <img src="/assets/paypal.svg" className="h-6" alt="Paypal" />
            <img src="/assets/mastercard.svg" className="h-6" alt="MC" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
