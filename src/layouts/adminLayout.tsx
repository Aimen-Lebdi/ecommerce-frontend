import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/sideBar";

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
