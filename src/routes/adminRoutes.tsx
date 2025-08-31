import Categories from "../pages/admin/categories";
import AdminLayout from "../layouts/adminLayout";

import Dashboard from "../pages/admin/dashboard";
import SubCategories from "../pages/admin/subCategories";
import Products from "../pages/admin/products";
import Orders from "../pages/admin/orders";
import Users from "../pages/admin/users";

const AdminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    { index: true, element: <Dashboard /> },
    { path: "categories", element: <Categories /> },
    { path: "sub-categories", element: <SubCategories /> },
    { path: "products", element: <Products /> },
    { path: "orders", element: <Orders /> },
    { path: "users", element: <Users /> },
  ],
};

export default AdminRoutes;
