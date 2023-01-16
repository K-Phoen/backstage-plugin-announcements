import React, { useState } from 'react';
import { useAsync } from 'react-use';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { BackstageTheme } from '@backstage/theme';
import {
  IconButton,
  makeStyles,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Close from '@material-ui/icons/Close';
import { announcementsApiRef } from '../../api';
import { announcementViewRouteRef } from '../../routes';

const useStyles = makeStyles((theme: BackstageTheme) => ({
  root: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(0),
    marginTop: theme.spacing(0),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  // showing on top
  topPosition: {
    position: 'relative',
    marginBottom: theme.spacing(6),
    marginTop: -theme.spacing(3),
    zIndex: 'unset',
  },
  icon: {
    fontSize: 20,
  },
  bannerIcon: {
    fontSize: 20,
    marginRight: '0.5rem',
  },
  content: {
    width: '100%',
    maxWidth: 'inherit',
    flexWrap: 'nowrap',
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.banner.text,
    '& a': {
      color: theme.palette.banner.link,
    },
  },
  info: {
    backgroundColor: theme.palette.banner.info,
  },
}));

export const NewAnnouncementBanner = () => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const {
    value: announcements,
    loading,
    error,
  } = useAsync(async () =>
    announcementsApi.announcements({
      max: 1,
    }),
  );
  const lastSeen = announcementsApi.lastSeenDate();
  const [bannerOpen, setBannerOpen] = useState(true);

  if (loading) {
    return <></>;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (announcements?.length === 0) {
    return <></>;
  }

  const announcement = announcements![0];

  // this announcement was already seen
  if (lastSeen >= DateTime.fromISO(announcement.created_at)) {
    return <></>;
  }

  const message = (
    <>
      <span className={classes.bannerIcon}>📣</span>
      <Link to={viewAnnouncementLink({ id: announcement.id })}>
        {announcement.title}
      </Link>
      &nbsp;– {announcement.excerpt}
    </>
  );

  const handleClick = () => {
    announcementsApi.markLastSeenDate(
      DateTime.fromISO(announcement.created_at),
    );
    setBannerOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={bannerOpen}
      classes={{
        root: classNames(classes.root, classes.topPosition),
      }}
    >
      <SnackbarContent
        classes={{
          root: classNames(classes.content, classes.info),
          message: classes.message,
        }}
        message={message}
        action={[
          <IconButton
            key="dismiss"
            title="Mark as seen"
            color="inherit"
            onClick={handleClick}
          >
            <Close className={classes.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};
