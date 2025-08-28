import ProductCard from "./ProductCard";

type Product = {
  id: number;
  title: string;
  image: string;
  price: string;
};

type ProductCarouselSectionProps = {
  title: string;
  products: Product[];
};

const ProductCarouselSection = ({ title, products }: ProductCarouselSectionProps) => {
  return (
    <section className="my-10">
      <h2 className="text-xl font-bold text-secondary mb-4">{title}</h2>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            price={product.price}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarouselSection;
