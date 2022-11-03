import React from 'react';
import { InfoCard, Link, Progress } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import { DateTime } from 'luxon';
import { useAsync } from 'react-use';
import { announcementsApiRef } from '../../api';
import { announcementViewRouteRef, rootRouteRef } from '../../routes';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

export const AnnouncementsCard = () => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();

  const { value: announcements, loading, error } = useAsync(async () => announcementsApi.latestAnnouncements());

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
    <InfoCard title="Announcements" variant="gridItem" deepLink={deepLink}>
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
      </List>
    </InfoCard>
  );
};
