import {
  TdsHeader,
  TdsHeaderHamburger,
  TdsHeaderTitle,
  TdsHeaderDropdown,
  TdsHeaderDropdownList,
  TdsBadge,
  TdsHeaderDropdownListItem,
  TdsHeaderDropdownListUser,
  TdsHeaderBrandSymbol,
  TdsIcon,
} from '@scania/tegel-react';

interface HeaderProps {
  className?: string;
  pathname: string;
  toggleMobileNav: () => void;
}

const Header = ({ className, toggleMobileNav, pathname }: HeaderProps) => {
  return (
    <div className={className}>
      <TdsHeader>
        <TdsHeaderHamburger
          onClick={() => {
            toggleMobileNav();
          }}
          aria-label="Open application drawer"
          aria-haspopup="true"
          aria-expanded="false"
        ></TdsHeaderHamburger>

        <TdsHeaderTitle>React Demo</TdsHeaderTitle>

        <TdsHeaderDropdown>
          <span slot="label">Wheel types</span>
          <TdsHeaderDropdownList>
            <TdsHeaderDropdownListItem selected={pathname === '/about'}>
              <a href="/about">About</a>
            </TdsHeaderDropdownListItem>
            <TdsHeaderDropdownListItem selected={pathname === '/table'}>
              <a href="/table">Table</a>
            </TdsHeaderDropdownListItem>
          </TdsHeaderDropdownList>
        </TdsHeaderDropdown>

        <TdsHeaderDropdown onClick={() => {}} slot="end" no-dropdown-icon>
          <div slot="icon">
            <img
              src="https://www.svgrepo.com/show/384676/account-avatar-profile-user-6.svg"
              alt="User menu."
            />
            <TdsBadge size="sm"></TdsBadge>
          </div>
          <TdsHeaderDropdownList size="lg">
            <TdsHeaderDropdownListUser
              header="User Name"
              subheader="Place of Work"
            ></TdsHeaderDropdownListUser>
            <TdsHeaderDropdownListItem>
              <a href="/settings">
                <TdsIcon name="settings"></TdsIcon>
                <div className="tds-u-pl1">Settings</div>
              </a>
            </TdsHeaderDropdownListItem>
            <TdsHeaderDropdownListItem>
              <a href="/notifications">
                <TdsBadge value="0"></TdsBadge>
                <div className="tds-u-pl1">Notifications</div>
              </a>
            </TdsHeaderDropdownListItem>
          </TdsHeaderDropdownList>
        </TdsHeaderDropdown>

        <TdsHeaderBrandSymbol slot="end">
          <a aria-label="Scania - red gryphon on blue shield" href="/"></a>
        </TdsHeaderBrandSymbol>
      </TdsHeader>
    </div>
  );
};

export default Header;