
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../MainLayout.css';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          pathname={window.location.pathname} 
          toggleMobileNav={() => {}} 
        />
        <div className="flex flex-grow">
          {/* Left side - Login Form */}
          <div className="w-[480px] bg-white p-8 flex flex-col">
            <div className="h-16 flex items-center">
              <span className="text-lg font-semibold text-[#0D1C2E]">APPLICATION NAME</span>
            </div>
            {children}
          </div>
  
          {/* Right side - Background Image */}
          <div 
            className="flex-1 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/scania-truck.jpg)'
            }}
          />
        </div>
        <Footer />
      </div>
    );
  };

export default AuthLayout;