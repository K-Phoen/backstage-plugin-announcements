import { DateTime } from 'luxon';

export type Announcement = {
  id: string;
  type?: 'info' | 'warning' | 'error';
  category?: Category;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: DateTime;
};

export type Category = {
  slug: string;
  title: string;
};
