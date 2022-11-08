import React from 'react';
import { InfoCard, Link, Progress } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import { DateTime } from 'luxon';
import { useAsync } from 'react-use';
import { announcementsApiRef } from '../../api';
import { announcementCreateRouteRef, announcementViewRouteRef, rootRouteRef } from '../../routes';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
};

export const AnnouncementsCard = ({ title, max }: AnnouncementsCardOpts) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const createAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();

  const { value: announcements, loading, error } = useAsync(async () => announcementsApi.announcements({
    max: max || 5,
  }));

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const deepLink = {
    link: announcementsLink(),
    title: 'See all',
  };

  return (
    <InfoCard title={title || "Announcements"} variant="gridItem" deepLink={deepLink}>
      <List dense>
        {announcements?.map(announcement => (
          <ListItem key={announcement.id}>
            <ListItem button>
              {lastSeen < DateTime.fromISO(announcement.created_at) &&
                <ListItemIcon className={classes.newAnnouncementIcon} title="New"><NewReleasesIcon /></ListItemIcon>}

              <ListItemText
                primary={<Link to={viewAnnouncementLink({ id: announcement.id })}>{announcement.title}</Link>}
                secondary={`${DateTime.fromISO(announcement.created_at).toRelative()} – ${announcement.excerpt}`}
              />
            </ListItem>
          </ListItem>
        ))}
        {announcements?.length === 0 && (
          <ListItem>
            <ListItemText>No announcements yet, want to <Link to={createAnnouncementLink()}>add one</Link>?</ListItemText>
          </ListItem>
        )}
      </List>
    </InfoCard>
  );
};
