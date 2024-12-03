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
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  className?: string;
  pathname: string;
  toggleMobileNav: () => void;
  onLogout: () => void;
}

interface UserData {
  name?: string;
  login: string;
  company?: string;
}

const Header = ({ className, toggleMobileNav, onLogout }: HeaderProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const isAuthenticated = !!localStorage.getItem('github_token');
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('github_token');
      if (!token) return;

      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setUserData(null);
    if (onLogout) {
      onLogout();
    }
    navigate('/login', { replace: true });
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
                header={userData ? (userData.name || userData.login) : 'Not Logged In'}
                subheader={userData?.company || 'No Company Listed'}
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