import React from 'react';
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { useAnalytics } from '@backstage/core-plugin-api';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import {
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

const useStyles = makeStyles({
  createdAt: {
    display: 'block',
    marginTop: '0.2rem',
    marginBottom: '0.8rem',
    fontSize: '0.8rem',
  },
  excerpt: {
    lineHeight: '1.55',
  },
  itemText: {
    wordBreak: 'break-all',
  },
});

export type IndexableAnnouncement = IndexableDocument & {
  createdAt: string;
};

type Props = {
  result: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
};

export const AnnouncementSearchResultListItem = ({
  result,
  rank,
  highlight,
}: Props) => {
  const classes = useStyles();
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.captureEvent('discover', result.title, {
      attributes: { to: result.location },
      value: rank,
    });
  };

  const document = result as IndexableAnnouncement;

  const title = (
    <Link noTrack to={result.location} onClick={handleClick}>
      {highlight?.fields.title ? (
        <HighlightedSearchResultText
          text={highlight.fields.title}
          preTag={highlight.preTag}
          postTag={highlight.postTag}
        />
      ) : (
        result.title
      )}
    </Link>
  );
  const excerpt = (
    <>
      <span className={classes.createdAt}>
        Published{' '}
        <span title={document.createdAt}>
          {DateTime.fromISO(document.createdAt).toRelative()}
        </span>
      </span>
      <>
        {highlight?.fields.text ? (
          <HighlightedSearchResultText
            text={highlight.fields.text}
            preTag={highlight.preTag}
            postTag={highlight.postTag}
          />
        ) : (
          result.text
        )}
      </>
    </>
  );

  return (
    <>
      <ListItem alignItems="center">
        <ListItemIcon title="Announcement">
          <RecordVoiceOverIcon />
        </ListItemIcon>
        <ListItemText
          primary={title}
          secondary={excerpt}
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
        />
      </ListItem>

      <Divider component="li" />
    </>
  );
};
