// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// export default function ProtectedRoute({ role }: { role: "user" | "admin" }) {
//   const { user } = useSelector((state: any) => state.auth);

//   if (!user) return <Navigate to="/login" replace />;

//   if (role === "admin" && user.role !== "admin")
//     return <Navigate to="/" replace />;

//   return <Outlet />;
// }
