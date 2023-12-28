import { IndexableDocument } from '@backstage/plugin-search-common';

export type Category = {
  slug: string;
  title: string;
};

export type Announcement = {
  id: string;
  category?: Category;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
};

export type AnnouncementsList = {
  count: number;
  results: Announcement[];
};

export type IndexableAnnouncement = IndexableDocument & {
  excerpt: string;
  createdAt: string;
};

export type CreateAnnouncementRequest = Omit<
  Announcement,
  'id' | 'category' | 'created_at'
> & {
  category?: string;
};

export type UpdateAnnouncementRequest = CreateAnnouncementRequest;

export type CreateCategoryRequest = {
  title: string;
};
