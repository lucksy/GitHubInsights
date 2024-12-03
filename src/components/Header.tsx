import {
  TdsHeader,
  TdsHeaderHamburger,
  TdsHeaderTitle,
  TdsHeaderDropdown,
  TdsHeaderDropdownList,
  TdsHeaderDropdownListItem,
  TdsHeaderDropdownListUser,
  TdsHeaderBrandSymbol,
  TdsIcon,
} from '@scania/tegel-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GitHubUser } from '../types/github';

interface HeaderProps {
  className?: string;
  pathname: string;
  toggleMobileNav: () => void;
}

const Header = ({ className, toggleMobileNav }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
  };

  const getUserDisplayName = (user: GitHubUser | null) => {
    if (!user) return 'Not Logged In';
    return user.name || user.login;
  };

  const getUserCompany = (user: GitHubUser | null) => {
    if (!user) return 'No Company Listed';
    return user.company || 'No Company Listed';
  };

  return (
    <div className={className}>
      <TdsHeader>
        <TdsHeaderHamburger
          onClick={toggleMobileNav}
          aria-label="Open application drawer"
          aria-haspopup="true"
          aria-expanded="false"
        />

        <TdsHeaderTitle>GitHub Insights Dashboard</TdsHeaderTitle>

        {!isLoginPage && (
          <TdsHeaderDropdown onClick={() => {}} slot="end" no-dropdown-icon>
            <div slot="icon">
              <img
                src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
                alt="User menu"
                style={{ filter: !isAuthenticated ? 'grayscale(100%)' : 'none' }}
              />
            </div>
            <TdsHeaderDropdownList size="lg">
              <TdsHeaderDropdownListUser
                header={getUserDisplayName(user)}
                subheader={getUserCompany(user)}
              />
              <TdsHeaderDropdownListItem>
                <a href="/settings">
                  <TdsIcon name="settings" />
                  <div className="tds-u-pl1">Settings</div>
                </a>
              </TdsHeaderDropdownListItem>
              <TdsHeaderDropdownListItem>
                <button 
                  onClick={handleLogout} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <div className="tds-u-pl1">Logout</div>
                </button>
              </TdsHeaderDropdownListItem>
            </TdsHeaderDropdownList>
          </TdsHeaderDropdown>
        )}

        <TdsHeaderBrandSymbol slot="end">
          <a aria-label="Scania - red gryphon on blue shield" href="/" />
        </TdsHeaderBrandSymbol>
      </TdsHeader>
    </div>
  );
};

export default Header;