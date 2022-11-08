import { errorHandler } from '@backstage/backend-common';
import express, { Request } from 'express';
import Router from 'express-promise-router';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { AnnouncementsContext } from './announcementsContextBuilder';
import { Announcement } from './model';

interface AnnouncementRequest {
  publisher: string;
  title: string;
  excerpt: string;
  body: string;
}

export async function createRouter(options: AnnouncementsContext): Promise<express.Router> {
  const persistenceContext = options.persistenceContext;

  const router = Router();
  router.use(express.json());

  router.get('/', async (req: Request<{}, {}, {}, { max?: number }>, res) => {
    const results = await persistenceContext.announcementsStore.announcements(req.query);

    return res.json(results);
  });

  router.get('/:id', async (req: Request<{id: string}, {}, {}, {}>, res) => {
    const result = await persistenceContext.announcementsStore.announcementByID(req.params.id);

    return res.json(result);
  });

  router.delete('/:id', async (req: Request<{id: string}, {}, {}, {}>, res) => {
    await persistenceContext.announcementsStore.deleteAnnouncementByID(req.params.id);

    return res.status(204).end();
  });

  router.post('/', async (req, res) => {
    const announcementRequest: AnnouncementRequest = req.body;

    const announcement: Announcement = {
      ...announcementRequest,
      ...{
        id: uuid(),
        created_at: DateTime.now(),
      },
    };

    await persistenceContext.announcementsStore.insertAnnouncement(announcement);

    return res.status(201).json(announcement);
  });

  router.put('/:id', async (req: Request<{id: string}, {}, AnnouncementRequest, {}>, res) => {
    const announcement = await persistenceContext.announcementsStore.announcementByID(req.params.id);
    if (!announcement) {
      return res.status(404).end();
    }

    const updatedAnnouncement: Announcement = {
      ...announcement,
      ...{
        title: req.body.title,
        excerpt: req.body.excerpt,
        body: req.body.body,
        publisher: req.body.publisher,
      },
    };

    await persistenceContext.announcementsStore.updateAnnouncement(updatedAnnouncement);

    return res.status(200).json(updatedAnnouncement);
  });

  router.use(errorHandler());

  return router;
}
