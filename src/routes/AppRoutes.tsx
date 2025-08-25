// 📄 src/routes/AppRoutes.tsx

import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import ComparePage from '../pages/ComparePage';
import WishlistPage from '../pages/WishlistPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/product/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Add more routes here */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
