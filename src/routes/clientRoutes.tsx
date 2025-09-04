import UserLayout from "../layouts/clientLayout";

import Home from "../pages/client/Home";
import Shop from "../pages/client/Shop";
import ProductDetail from "../pages/client/ProductDetail";
import ComparePage from "../pages/client/ComparePage";
import WishlistPage from "../pages/client/WishlistPage";
import Payment from "../pages/client/payment";
import About from "../pages/client/About";
import ShopPage from "../pages/client/Shop";
import ProductDetails from "../pages/client/ProductDetail";

const UserRoutes = {
  path: "/",
  element: <UserLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "about", element: <About /> },
    { path: "shop", element: <ShopPage /> },
    { path: "product/:id", element: <ProductDetails /> },
    { path: "compare", element: <ComparePage /> },
    { path: "wishlist", element: <WishlistPage /> },
    { path: "payment", element: <Payment /> },
  ],
};

export default UserRoutes;
