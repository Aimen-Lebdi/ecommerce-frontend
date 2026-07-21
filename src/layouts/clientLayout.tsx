import { Header } from '../components/client/clientLayout/Header';
import { Footer } from '../components/client/clientLayout/Footer';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';


const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet></Outlet>
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;