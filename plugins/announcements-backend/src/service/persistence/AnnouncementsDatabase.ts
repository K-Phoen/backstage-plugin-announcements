import { Knex } from 'knex';

const announcementsTable = 'announcements';

export type Announcement = {
  id: string;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: Date;
};

type AnnouncementsFilters = {
  max?: number;
};

export class AnnouncementsDatabase {
  constructor(private readonly db: Knex) { }

  async announcements(request: AnnouncementsFilters): Promise<Announcement[]> {
    const queryBuilder = this.db<Announcement>(announcementsTable).orderBy('created_at', 'desc');

    if (request.max) {
      queryBuilder.limit(request.max);
    }

    return queryBuilder.select();
  }

  async announcementByID(id: string): Promise<Announcement | undefined> {
    return this.db<Announcement>(announcementsTable).where('id', id).first();
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.db<Announcement>(announcementsTable).where('id', id).delete();
  }

  async insertAnnouncement(announcement: Announcement) {
    await this.db<Announcement>(announcementsTable).insert(announcement);
  }

  async updateAnnouncement(announcement: Announcement) {
    await this.db<Announcement>(announcementsTable).where('id', announcement.id).update(announcement);
  }
}
