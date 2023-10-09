import React from 'react';
import { useAsync } from 'react-use';
import { DateTime } from 'luxon';
import { usePermission } from '@backstage/plugin-permission-react';
import { InfoCard, Link, Progress } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { announcementEntityPermissions } from '@kurtaking/backstage-plugin-announcements-common';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import { announcementsApiRef } from '../../api';
import {
  announcementCreateRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';

const useStyles = makeStyles({
  newAnnouncementIcon: {
    minWidth: '36px',
  },
});

type AnnouncementsCardOpts = {
  title?: string;
  max?: number;
  category?: string;
};

export const AnnouncementsCard = ({
  title,
  max,
  category,
}: AnnouncementsCardOpts) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const createAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const lastSeen = announcementsApi.lastSeenDate();

  const {
    value: announcements,
    loading,
    error,
  } = useAsync(async () =>
    announcementsApi.announcements({
      max: max || 5,
      category,
    }),
  );
  const { announcementCreatePermission } = announcementEntityPermissions;
  const { loading: loadingPermission, allowed: canAdd } = usePermission({
    permission: announcementCreatePermission,
  });

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
    <InfoCard
      title={title || 'Announcements'}
      variant="gridItem"
      deepLink={deepLink}
    >
      <List dense>
        {announcements?.results.map(announcement => (
          <ListItem key={announcement.id}>
            <ListItem>
              {lastSeen < DateTime.fromISO(announcement.created_at) && (
                <ListItemIcon
                  className={classes.newAnnouncementIcon}
                  title="New"
                >
                  <NewReleasesIcon />
                </ListItemIcon>
              )}

              <ListItemText
                primary={
                  <Link to={viewAnnouncementLink({ id: announcement.id })}>
                    {announcement.title}
                  </Link>
                }
                secondary={
                  <>
                    {DateTime.fromISO(announcement.created_at).toRelative()}
                    {announcement.category && (
                      <>
                        {' '}
                        in{' '}
                        <Link
                          to={`${announcementsLink()}?category=${
                            announcement.category.slug
                          }`}
                        >
                          {announcement.category.title}
                        </Link>
                      </>
                    )}{' '}
                    – {announcement.excerpt}
                  </>
                }
              />
            </ListItem>
          </ListItem>
        ))}
        {announcements?.count === 0 && !loadingPermission && canAdd && (
          <ListItem>
            <ListItemText>
              No announcements yet, want to{' '}
              <Link to={createAnnouncementLink()}>add one</Link>?
            </ListItemText>
          </ListItem>
        )}
      </List>
    </InfoCard>
  );
};
