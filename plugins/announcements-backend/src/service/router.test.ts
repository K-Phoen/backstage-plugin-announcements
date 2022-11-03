import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { AnnouncementsContext } from './announcementsContextBuilder';
import { Announcement, AnnouncementsDatabase } from './persistence/AnnouncementsDatabase';
import { PersistenceContext } from './persistence/persistenceContext';
import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;

  const announcementsMock = jest.fn();
  const announcementByIDMock = jest.fn();
  const deleteAnnouncementByIDMock = jest.fn();
  const insertAnnouncementMock = jest.fn();
  const updateAnnouncementMock = jest.fn();

  const mockPersistenceContext: PersistenceContext = {
    announcementsStore: {
      announcements: announcementsMock,
      announcementByID: announcementByIDMock,
      deleteAnnouncementByID: deleteAnnouncementByIDMock,
      insertAnnouncement: insertAnnouncementMock,
      updateAnnouncement: updateAnnouncementMock,
    } as unknown as AnnouncementsDatabase,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const announcementsContext: AnnouncementsContext = {
      logger: getVoidLogger(),
      persistenceContext: mockPersistenceContext,
    }

    const router = await createRouter(announcementsContext);
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /', () => {
    it('returns ok', async () => {
      announcementsMock.mockReturnValueOnce([
        {
          id: "uuid",
          title: "title",
          excerpt: "excerpt",
          body: "body",
          publisher: "user:default/name",
          created_at: new Date("2022-11-02T15:28:08.539Z"),
        },
      ] as Announcement[]);

      const response = await request(app).get('/');

      expect(response.status).toEqual(200);
      expect(announcementsMock).toHaveBeenCalledWith({});
      expect(response.body).toEqual([
        {
          id: "uuid",
          title: "title",
          excerpt: "excerpt",
          body: "body",
          publisher: "user:default/name",
          created_at: "2022-11-02T15:28:08.539Z",
        },
      ]);
    });
  });
});
