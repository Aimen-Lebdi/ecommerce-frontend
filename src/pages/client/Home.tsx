import BlogSection from "../../components/client/home/Blogs";
import BestDeals from "../../components/client/home/BestDeals";
import Categories from "../../components/client/home/Categories";
import Hero from "../../components/client/home/Hero";
import NewArrivalsSection from "../../components/client/home/NewArrivals";

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
