import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout = ({ onLogout }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        pathname={window.location.pathname} 
        toggleMobileNav={() => {}} 
        onLogout={onLogout}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;