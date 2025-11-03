import ProductCard from "./ProductCard";

const dummyProducts = [
  {
    id: 1,
    image: "https://via.placeholder.com/150",
    name: "Samsung Galaxy S20",
    rating: 4,
    price: "$820.00",
    isHot: true,
  },
  {
    id: 2,
    image: "https://via.placeholder.com/150",
    name: "Amazon Basics HDMI Cable",
    rating: 5,
    price: "$30.00",
    isBestDeal: true,
  },
  {
    id: 3,
    image: "https://via.placeholder.com/150",
    name: "Sony Wireless Headphones",
    rating: 3,
    price: "$150.00",
    isSale: true,
  },
  // ... add more if needed
];

const ProductGrid = () => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {dummyProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
