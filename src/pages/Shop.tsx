import Sidebar from "../components/shop/Sidebar";
import ProductGrid from "../components/shop/ProductGrid";
import Pagination from "../components/shop/Pagination";
import ShopHeaderBar from "../components/shop/ShopHeaderBar";
import QuickViewModal from "../components/ui/QuickViewModal";
import { useState } from "react";

const ShopPage = () => {
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);
  return (
    <section className="flex gap-6 w-full p-6 bg-amber-50">
      {/* Left Sidebar */}
      <aside className="w-2/4">
        <Sidebar />
      </aside>

      {/* Right Content */}
      <main className="w-3/4">
        <ShopHeaderBar />
        <ProductGrid >
        </ProductGrid>
        <Pagination />
      </main>
      {/* Product Grid */}
      <button onClick={() => setQuickViewOpen(true)}>Quick View</button>

      {/* Modal */}
      <QuickViewModal isOpen={isQuickViewOpen} onClose={() => setQuickViewOpen(false)}  />
    {/* </div> */}
    </section>
  );
};

export default ShopPage;
