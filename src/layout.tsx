'use client';
import Footer from './components/Footer';
import Header from './components/Header';
import './MainLayout.css';

interface MainLayoutProps {
  children?: React.ReactNode;
  pathname?: string;
  toggleMobileNav?: () => void;
  mode?: string;
  modeVariant?: string;
  shouldRenderBreadcrumbs?: boolean;
  shouldRenderModeSwitcher?: boolean;
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
        className={`mode-variant-wrapper`}
      >
          <div className="header-and-banner">
            <Header className="app-header" pathname={pathname} toggleMobileNav={toggleMobileNav} onLogout={() => { /* handle logout */ }} />
          </div>
          <div className="side-menu-and-main">
            <main>
              <div className="content-container">{children}</div>
              <Footer />
            </main>
          </div>
      </div>
    </div>
  );
};

export default MainLayout;
