import { lazy, Suspense } from "react";
import UserLayout from "../layouts/clientLayout";
import ProtectedRoute from "./protectedRoute";
import RouteFallback from "../components/RouteFallback";

// Route-level code splitting: each page ships as its own chunk so the
// storefront entry bundle stays lean (admin console, charts, and editor
// dependencies never load until their route is visited).
const Home = lazy(() => import("../pages/client/Home"));
const About = lazy(() => import("../pages/client/About"));
const ContactUs = lazy(() => import("../pages/client/ContactUs"));
const ShopPage = lazy(() => import("../pages/client/Shop"));
const ProductDetails = lazy(() => import("../pages/client/ProductDetail"));
const Cart = lazy(() => import("../pages/client/Cart"));
const Checkout = lazy(() => import("../pages/client/Checkout"));
const OrderConfirmationPage = lazy(
  () => import("../pages/client/orderConfirmation")
);
const MyAccountDashboard = lazy(() => import("../pages/client/myAccount"));
const SignUpPage = lazy(() => import("../pages/client/SignUp"));
const SignInPage = lazy(() => import("../pages/client/SignIn"));
const ForgotPasswordPage = lazy(() => import("../pages/client/ForgetPassword"));
const CodeVerificationPage = lazy(
  () => import("../pages/client/CodeVerification")
);
const ResetPasswordPage = lazy(() => import("../pages/client/ResetPassword"));
const WishlistPage = lazy(() => import("../pages/client/WishlistPage"));
const OrderTracking = lazy(() => import("../pages/client/orderTracking"));

/** Wrap a lazily-loaded page in a Suspense boundary with the shared fallback. */
const page = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const UserRoutes = {
  path: "/",
  element: <UserLayout />,
  children: [
    // Public routes
    { index: true, element: page(<Home />) },
    { path: "about", element: page(<About />) },
    { path: "contact", element: page(<ContactUs />) },
    { path: "shop", element: page(<ShopPage />) },
    { path: "product/:id", element: page(<ProductDetails />) },
    { path: "sign-up", element: page(<SignUpPage />) },
    { path: "sign-in", element: page(<SignInPage />) },
    { path: "forgot-password", element: page(<ForgotPasswordPage />) },
    { path: "verify-reset-code", element: page(<CodeVerificationPage />) },
    { path: "reset-password", element: page(<ResetPasswordPage />) },

    // Protected routes (require authentication)
    {
      element: <ProtectedRoute role="user" />,
      children: [
        { path: "wishlist", element: page(<WishlistPage />) },
        { path: "cart", element: page(<Cart />) },
        { path: "/checkout", element: page(<Checkout />) },
        {
          path: "/order-confirmation/:id",
          element: page(<OrderConfirmationPage />),
        },
        { path: "/order-confirmation", element: page(<OrderConfirmationPage />) },
        { path: "/orders/:id/tracking", element: page(<OrderTracking />) },
        { path: "my-account", element: page(<MyAccountDashboard />) },
      ],
    },
  ],
};

export default UserRoutes;