import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserRoutes from "./clientRoutes";
import AdminRoutes from "./adminRoutes";

const router = createBrowserRouter([UserRoutes, AdminRoutes]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
