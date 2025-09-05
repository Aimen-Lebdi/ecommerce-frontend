import UserLayout from "../layouts/clientLayout";

import Home from "../pages/client/Home";
import ComparePage from "../pages/client/ComparePage";
import WishlistPage from "../pages/client/WishlistPage";
import Payment from "../pages/client/payment";
import About from "../pages/client/About";
import ShopPage from "../pages/client/Shop";
import ProductDetails from "../pages/client/ProductDetail";
import Cart from "../pages/client/Cart";
import Checkout from "../pages/client/Checkout";
import OrderConfirmationPage from "../pages/client/orderConfirmation";
import MyAccountDashboard from "../pages/client/myAccount";

const UserRoutes = {
  path: "/",
  element: <UserLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "about", element: <About /> },
    { path: "shop", element: <ShopPage /> },
    { path: "product/:id", element: <ProductDetails /> },
    { path: "cart", element: <Cart /> },
    { path: "checkout", element: <Checkout /> },
    { path: "order-confirmation", element: <OrderConfirmationPage /> },
    { path: "my-account", element: <MyAccountDashboard /> },
    { path: "compare", element: <ComparePage /> },
    { path: "wishlist", element: <WishlistPage /> },
    { path: "payment", element: <Payment /> },
  ],
};

export default UserRoutes;
