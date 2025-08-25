
type ProductCardProps = {
  image: string;
  title: string;
  price: string;
};

const ProductCard = ({ image, title, price }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-52 hover:shadow-lg transition">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-contain mb-2"
      />
      <h3 className="text-sm font-semibold text-secondary">{title}</h3>
      <p className="text-blue font-bold mt-1">{price}</p>
    </div>
  );
};

export default ProductCard;
