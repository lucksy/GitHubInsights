'use client';
import Footer from './components/Footer';
// import Header from '../../components/layouts/Navigation/Header';
import './MainLayout.css';

interface MainLayoutProps {
  children?: React.ReactNode;
  pathname?: string;
  toggleMobileNav?: () => void;
  mode?: string;
  modeVariant?: string; // Define the type for modeVariant
  shouldRenderBreadcrumbs?: boolean; // Define the type for shouldRenderBreadcrumbs
  shouldRenderModeSwitcher?: boolean; // Define the type for shouldRenderBreadcrumbs
}

const MainLayout = ({
  children,
  pathname = '/',
  toggleMobileNav = () => {
  },
}: MainLayoutProps) => {

  return (
    <div className={`App mode-wrapper`}>
      <div
        className={`mode-variant-wrapper tds-mode-variant-${
          primaryVariant === 'on' ? 'primary' : 'secondary'
        }`}
      >
          <div className="header-and-banner">
            <Header className="app-header" pathname={pathname} toggleMobileNav={toggleMobileNav} />
          </div>
          <div className="side-menu-and-main">
            <main
              style={{
                marginTop: `${headerAndBannerHeight}px`,
              }}
            >
              <div className="content-container">{children}</div>
              <Footer />
            </main>
          </div>
      </div>
    </div>
  );
};

export default MainLayout;
