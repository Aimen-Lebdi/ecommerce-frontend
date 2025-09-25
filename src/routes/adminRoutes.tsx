import Categories from "../pages/admin/categories";
import AdminLayout from "../layouts/adminLayout";
import ProtectedRoute from "./protectedRoute";

import Dashboard from "../pages/admin/dashboard";
import SubCategories from "../pages/admin/subCategories";
import Products from "../pages/admin/products";
import Orders from "../pages/admin/orders";
import Users from "../pages/admin/users";
import Brands from "../pages/admin/brands";

const AdminRoutes = {
  path: "/admin",
  element: <ProtectedRoute role="admin" />,
  children: [
    {
      path: "",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "categories", element: <Categories /> },
        { path: "sub-categories", element: <SubCategories /> },
        { path: "brands", element: <Brands /> },
        { path: "products", element: <Products /> },
        { path: "orders", element: <Orders /> },
        { path: "users", element: <Users /> },
      ],
    },
  ],
};

export default AdminRoutes;
