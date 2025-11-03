import { X, Heart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CompareCard({ product }: { product: any }) {
  return (
    <div className="border rounded-lg p-4  bg-white shadow-sm">
      <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
        <X size={16} />
      </button>

      <img src={product.image} alt={product.title} className="w-full h-40 object-contain mb-4" />
      <h2 className="text-sm font-semibold mb-2">{product.title}</h2>

      <div className="flex gap-2">
        <button className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600">Add to Cart</button>
        <button className="border px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100">
          <Heart size={14} />
        </button>
      </div>
    </div>
  );
}