import { DateTime } from 'luxon';

export type Announcement = {
  id: string;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: DateTime;
};
