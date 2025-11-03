import { useState } from 'react';
import { Star } from 'lucide-react';

const ProductDetailTop = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = [
    '/images/macbook-1.jpg',
    '/images/macbook-2.jpg',
    '/images/macbook-3.jpg',
    '/images/macbook-4.jpg',
  ];

  return (
    <section className="flex flex-col lg:flex-row gap-10 bg-white p-8 rounded-lg shadow-md">
      {/* Left - Image Gallery */}
      <div className="flex flex-col gap-4">
        <img
          src={images[selectedImage]}
          alt="Main product"
          className="w-full max-w-md rounded-lg border border-gray-200"
        />
        <div className="flex gap-2 justify-center">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              onClick={() => setSelectedImage(idx)}
              alt={`Thumbnail ${idx}`}
              className={`w-20 h-16 object-cover rounded-md border cursor-pointer transition ${
                idx === selectedImage ? 'border-blue-500' : 'border-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right - Product Info */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">
          2023 Apple MacBook Pro with Apple M1 Chip (13-inch, 8GB RAM, 512GB SSD Storage) - Space Gray
        </h1>

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <span className="flex items-center gap-1 text-orange-500">
            <Star size={16} fill="currentColor" />
            4.7
          </span>
          <span>(2871 reviews)</span>
        </div>

        <div className="mt-4 text-xl text-gray-900 font-semibold">
          $1699 <span className="text-sm line-through text-gray-400 ml-2">$1999</span>
          <span className="ml-2 text-green-600 text-sm">21% OFF</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-sm">Color</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1">
              <option>Space Gray</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm">Size</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1">
              <option>13-inch Liquid Retina XDR display</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm">Memory</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1">
              <option>8GB unified memory</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-sm">Storage</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1">
              <option>512GB SSD Storage</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4 items-center">
          <input
            type="number"
            defaultValue={1}
            min={1}
            className="w-16 text-center border border-gray-300 rounded py-1"
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded">
            ADD TO CART
          </button>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded">
            BUY NOW
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600 flex gap-4 flex-wrap">
          <span>✔️ 100% Guarantee Safe Checkout</span>
          <span>✔️ 30 Days Money Back</span>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailTop;
