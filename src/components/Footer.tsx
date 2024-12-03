import { TdsFooter, TdsFooterGroup, TdsFooterItem, TdsIcon } from '@scania/tegel-react';

export default function Footer() {
  return (
    <TdsFooter>
      <div slot="start">
        <TdsFooterGroup>
          <TdsFooterItem>
            <a href="/">Link text</a>
          </TdsFooterItem>
          <TdsFooterItem>
            <a href="/">Link text</a>
          </TdsFooterItem>
          <TdsFooterItem>
            <a href="/">Link text</a>
          </TdsFooterItem>
          <TdsFooterItem>
            <a href="/">Link text</a>
          </TdsFooterItem>
        </TdsFooterGroup>
      </div>
      <div slot="end">
        <TdsFooterGroup>
          <TdsFooterItem>
            <a href="/">
              <TdsIcon name="truck"></TdsIcon>
            </a>
          </TdsFooterItem>
          <TdsFooterItem>
            <a href="/">
              <TdsIcon name="truck"></TdsIcon>
            </a>
          </TdsFooterItem>
          <TdsFooterItem>
            <a href="/">
              <TdsIcon name="truck"></TdsIcon>
            </a>
          </TdsFooterItem>
        </TdsFooterGroup>
      </div>
    </TdsFooter>
  );
}
