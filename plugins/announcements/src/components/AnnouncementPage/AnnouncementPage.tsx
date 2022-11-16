import React from 'react';
import { DateTime } from 'luxon';
import { Progress, Page, Header, Content, MarkdownContent, InfoCard, Link } from '@backstage/core-components';
import { useApi, useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { Announcement, announcementsApiRef } from '../../api';
import { announcementViewRouteRef, rootRouteRef } from '../../routes';
import { Grid } from '@material-ui/core';

const AnnouncementDetails = ({ announcement }: { announcement: Announcement }) => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const entityLink = useRouteRef(entityRouteRef);
  const deepLink = {
    link: announcementsLink(),
    title: 'Back to announcements',
  };

  const publisherRef = parseEntityRef(announcement.publisher);
  const subHeader = (<span>
    By <Link to={entityLink(publisherRef)}>{publisherRef.name}</Link>, {DateTime.fromISO(announcement.created_at).toRelative()}
  </span>);

  return (
    <InfoCard
      title={announcement.title}
      subheader={subHeader}
      deepLink={deepLink}
    >
      <MarkdownContent content={announcement.body} />
    </InfoCard>
  );
};

export const AnnouncementPage = () => {
  const announcementsApi = useApi(announcementsApiRef);
  const { id } = useRouteRefParams(announcementViewRouteRef);
  const { value, loading, error } = useAsync(async () => announcementsApi.announcementByID(id));

  let title = "Announcements";
  let content: React.ReactNode = <Progress />;

  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else {
    title = `${value!.title} – Announcements`
    content = <AnnouncementDetails announcement={value!} />;

    const lastSeen = announcementsApi.lastSeenDate();
    const announcementCreatedAt = DateTime.fromISO(value!.created_at);

    if (announcementCreatedAt > lastSeen) {
      announcementsApi.markLastSeenDate(announcementCreatedAt);
    }
  }

  return (
    <Page themeId="home">
      <Header title={title} />

      <Content>
        <Grid container justify="center" alignItems="center">
          <Grid item sm={6}>
            {content}
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
