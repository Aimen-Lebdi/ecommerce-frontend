import UserLayout from "../layouts/clientLayout";

import Home from "../pages/client/Home";
import About from "../pages/client/About";
import ShopPage from "../pages/client/Shop";
import ProductDetails from "../pages/client/ProductDetail";
import Cart from "../pages/client/Cart";
import Checkout from "../pages/client/Checkout";
import OrderConfirmationPage from "../pages/client/orderConfirmation";
import MyAccountDashboard from "../pages/client/myAccount";
import SignUpPage from "../pages/client/SignUp";
import SignInPage from "../pages/client/SignIn";
import ForgotPasswordPage from "../pages/client/ForgetPassword";
import CodeVerificationPage from "../pages/client/CodeVerification";
import ResetPasswordPage from "../pages/client/ResetPassword";
import WishlistPage from "../pages/client/WishlistPage";

const UserRoutes = {
  path: "/",
  element: <UserLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "about", element: <About /> },
    { path: "shop", element: <ShopPage /> },
    { path: "product/:id", element: <ProductDetails /> },
    { path: "wishlist", element: <WishlistPage /> },
    { path: "cart", element: <Cart /> },
    { path: "checkout", element: <Checkout /> },
    { path: "order-confirmation", element: <OrderConfirmationPage /> },
    { path: "my-account", element: <MyAccountDashboard /> },
    { path: "sign-up", element: <SignUpPage /> },
    { path: "sign-in", element: <SignInPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> },
    { path: "verify-reset-code", element: <CodeVerificationPage /> },
    { path: "reset-password", element: <ResetPasswordPage /> },
  ],
};

export default UserRoutes;