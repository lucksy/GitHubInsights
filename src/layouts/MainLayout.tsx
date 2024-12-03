import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';



const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        pathname={window.location.pathname} 
        toggleMobileNav={() => {}} 
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;




// // src/layouts/MainLayout.tsx
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import '../MainLayout.css';

// interface MainLayoutProps {
//   children?: React.ReactNode;
// }

// const MainLayout = ({ children }: MainLayoutProps) => {
//   const location = window.location;

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header 
//         pathname={location.pathname} 
//         toggleMobileNav={() => {}}
//       />
//       <main className="flex-grow">
//         {children}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MainLayout;