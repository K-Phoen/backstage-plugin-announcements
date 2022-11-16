import { Content, Header, Page } from '@backstage/core-components';
import React from 'react';

export const FakeCatalogEntityPage = () => {
  return (
    <Page themeId="home">
      <Header title="FakeCatalogPage" />

      <Content>
        plop
      </Content>
    </Page>
  );
};
