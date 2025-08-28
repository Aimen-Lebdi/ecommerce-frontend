// src/pages/ProductDetail.tsx
// import { Star, Heart, ShoppingCart } from "lucide-react";
import ProductDetailTop from "../../components/client/ProductDetail/ProductDetailTop";
import ProductTabs from "../../components/client/ProductDetail/ProductTabs";
import FeatureBox from "../../components/client/ProductDetail/FeatureBox";
import ProductCarouselSection from "../../components/client/ProductDetail/ProductCarouselSection";
// import  Link  from "react-router-dom";
// import macbook from "../../public/macbook-main.png";
// import thumb1 from "../assets/thumb1.jpg";
// import thumb2 from "../assets/thumb2.jpg";
// Add your other thumbnails as needed
const sampleProducts = [
  {
    id: 1,
    title: "Bose Sport Earbuds",
    image: "/products/bose-earbuds.jpg",
    price: "$129.00",
  },
  {
    id: 2,
    title: "MacBook Charger",
    image: "/products/macbook-charger.jpg",
    price: "$59.00",
  },
  {
    id: 3,
    title: "AirPods Pro",
    image: "/products/airpods-pro.jpg",
    price: "$249.00",
  },
  {
    id: 4,
    title: "Gaming Mouse",
    image: "/products/gaming-mouse.jpg",
    price: "$69.00",
  },
];
const ProductDetail = () => {
  return (
    <section className="px-6 py-10 bg-white text-secondary dark:bg-primary dark:text-white">
      <ProductDetailTop></ProductDetailTop>
      {/* Tabs (takes 2/3 width) */}
      <div className="md:col-span-2">
        <ProductTabs />
      </div>

      {/* Feature Box (takes 1/3 width) */}
      <div>
        <FeatureBox />
      </div>
      <ProductCarouselSection
        title="RELATED PRODUCTS"
        products={sampleProducts}
      />
      <ProductCarouselSection
        title="PRODUCT ACCESSORIES"
        products={sampleProducts}
      />
      <ProductCarouselSection
        title="APPLE PRODUCTS"
        products={sampleProducts}
      />
      <ProductCarouselSection
        title="FEATURED PRODUCTS"
        products={sampleProducts}
      />
    </section>
  );
};

export default ProductDetail;
