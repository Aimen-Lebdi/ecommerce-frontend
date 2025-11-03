type Product = {
  id: number;
  image: string;
  name: string;
  rating: number;
  price: string;
  isHot?: boolean;
  isSale?: boolean;
  isBestDeal?: boolean;
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-contain"
        />
        {product.isHot && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 text-xs rounded-full">HOT</span>
        )}
        {product.isSale && (
          <span className="absolute top-2 left-2 bg-green-500 text-white px-2 text-xs rounded-full">SALE</span>
        )}
        {product.isBestDeal && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 text-xs rounded-full">BEST DEAL</span>
        )}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-secondary">{product.name}</h3>
      <div className="flex items-center gap-1 mt-2 text-yellow-400 text-sm">
        {'★'.repeat(product.rating)}
        {'☆'.repeat(5 - product.rating)}
      </div>
      <p className="mt-1 font-bold text-blue">{product.price}</p>
    </div>
  );
};

export default ProductCard;
