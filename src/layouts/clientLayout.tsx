import { Header } from '../components/client/clientLayout/Header';
import { Footer } from '../components/client/clientLayout/Footer';
import { Outlet } from 'react-router-dom';


const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet></Outlet>
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;