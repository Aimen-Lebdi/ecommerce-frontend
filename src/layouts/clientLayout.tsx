import Footer from "../components/client/Footer";
import Header from "../components/client/Header";
import { Outlet } from "react-router-dom";

const userLayout = () => {
  return (
    <div
      className="bg-gradient-to-br from-blue/90 to-primary/90 flex flex-col items-center
        min-h-screen"
    >
      <div className="w-10/12 relative">
        <Header />
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer/>
      </div>
    </div>
  );
};

export default userLayout;
