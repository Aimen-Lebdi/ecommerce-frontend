import BlogSection from "../components/home/blog/Blogs";
import BestDeals from "../components/home/bestDeals/BestDeals";
import Categories from "../components/home/categories/Categories";
import Hero from "../components/home/hero/Hero";
import NewArrivalsSection from "../components/home/newArrivals/NewArrivals";

const Home = () => {
  return (
    <section className="">
      <Hero />
      <BestDeals />
      <Categories />
      <NewArrivalsSection />
      <BlogSection />
    </section>
  );
};

export default Home;
