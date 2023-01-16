import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { Announcement } from '../model';

const announcementsTable = 'announcements';

export type DbAnnouncement = {
  id: string;
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
  created_at: string;
};

type AnnouncementsFilters = {
  max?: number;
};

const timestampToDateTime = (input: Date | string): DateTime => {
  if (typeof input === 'object') {
    return DateTime.fromJSDate(input).toUTC();
  }

  const result = input.includes(' ')
    ? DateTime.fromSQL(input, { zone: 'utc' })
    : DateTime.fromISO(input, { zone: 'utc' });
  if (!result.isValid) {
    throw new TypeError('Not valid');
  }

  return result;
};

const announcementToDB = (announcement: Announcement): DbAnnouncement => {
  return {
    id: announcement.id,
    title: announcement.title,
    excerpt: announcement.excerpt,
    body: announcement.body,
    publisher: announcement.publisher,
    created_at: announcement.created_at.toSQL(),
  };
};

const DBToAnnouncement = (announcementDb: DbAnnouncement): Announcement => {
  return {
    id: announcementDb.id,
    title: announcementDb.title,
    excerpt: announcementDb.excerpt,
    body: announcementDb.body,
    publisher: announcementDb.publisher,
    created_at: timestampToDateTime(announcementDb.created_at),
  };
};

export class AnnouncementsDatabase {
  constructor(private readonly db: Knex) {}

  async announcements(request: AnnouncementsFilters): Promise<Announcement[]> {
    const queryBuilder = this.db<DbAnnouncement>(announcementsTable).orderBy(
      'created_at',
      'desc',
    );

    if (request.max) {
      queryBuilder.limit(request.max);
    }

    return (await queryBuilder.select()).map(DBToAnnouncement);
  }

  async announcementByID(id: string): Promise<Announcement | undefined> {
    const dbAnnouncement = await this.db<DbAnnouncement>(announcementsTable)
      .where('id', id)
      .first();
    if (!dbAnnouncement) {
      return undefined;
    }

    return DBToAnnouncement(dbAnnouncement);
  }

  async deleteAnnouncementByID(id: string): Promise<void> {
    return this.db<DbAnnouncement>(announcementsTable).where('id', id).delete();
  }

  async insertAnnouncement(announcement: Announcement) {
    await this.db<DbAnnouncement>(announcementsTable).insert(
      announcementToDB(announcement),
    );
  }

  async updateAnnouncement(announcement: Announcement) {
    await this.db<DbAnnouncement>(announcementsTable)
      .where('id', announcement.id)
      .update(announcementToDB(announcement));
  }
}
