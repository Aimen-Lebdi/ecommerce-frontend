import { lazy, Suspense } from "react";
import ProtectedRoute from "./protectedRoute";
import RouteFallback from "../components/RouteFallback";

// Route-level code splitting: the admin console (and its chart/editor
// dependencies) loads as separate chunks, never with the storefront bundle.
const Dashboard = lazy(() => import("../pages/admin/dashboard"));
const Categories = lazy(() => import("../pages/admin/categories"));
const SubCategories = lazy(() => import("../pages/admin/subCategories"));
const Brands = lazy(() => import("../pages/admin/brands"));
const Products = lazy(() => import("../pages/admin/products"));
const Orders = lazy(() => import("../pages/admin/orders"));
const Users = lazy(() => import("../pages/admin/users"));
const AdminHelp = lazy(() => import("../pages/admin/help"));

// Lazy-load the admin shell too: it is only reachable behind authentication,
// so its sidebar/header code must never ship inside the storefront entry.
const AdminLayout = lazy(() => import("../layouts/adminLayout"));

/** Wrap a lazily-loaded page in a Suspense boundary with the shared fallback. */
const page = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const AdminRoutes = {
  path: "/admin",
  element: <ProtectedRoute role="admin" />,
  children: [
    {
      path: "",
      element: page(<AdminLayout />),
      children: [
        { index: true, element: page(<Dashboard />) },
        { path: "categories", element: page(<Categories />) },
        { path: "sub-categories", element: page(<SubCategories />) },
        { path: "brands", element: page(<Brands />) },
        { path: "products", element: page(<Products />) },
        { path: "orders", element: page(<Orders />) },
        { path: "users", element: page(<Users />) },
        { path: "help", element: page(<AdminHelp />) },
      ],
    },
  ],
};

export default AdminRoutes;
