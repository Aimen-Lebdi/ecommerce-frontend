import AdminLayout from "../layouts/adminLayout";

// import Dashboard from "@/pages/admin/Dashboard";
// import Products from "@/pages/admin/Products";
// import Orders from "@/pages/admin/Orders";
// import Users from "@/pages/admin/Users";

const AdminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    // { index: true, element: <Dashboard /> },
    // { path: "products", element: <Products /> },
    // { path: "orders", element: <Orders /> },
    // { path: "users", element: <Users /> },
  ],
};

export default AdminRoutes;
