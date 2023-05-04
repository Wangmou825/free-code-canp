import request from 'supertest';

import { setupServer, superPut } from '../../jest.utils';

const baseProfileUI = {
  isLocked: false,
  showAbout: false,
  showCerts: false,
  showDonation: false,
  showHeatMap: false,
  showLocation: false,
  showName: false,
  showPoints: false,
  showPortfolio: false,
  showTimeLine: false
};

const profileUI = {
  ...baseProfileUI,
  isLocked: true,
  showAbout: true,
  showDonation: true,
  showLocation: true,
  showName: true,
  showPortfolio: true
};

describe('settingRoutes', () => {
  setupServer();

  // This only tests one route, but all of the routes in the settings plugin add
  // the same hooks. So if this suite passes, the other routes should be
  // protected.
  describe('CSRF protection', () => {
    it('should return 403 if the _csrf secret is missing', async () => {
      const response = await request(fastifyTestInstance?.server).put(
        '/update-my-profileui'
      );

      expect(response?.statusCode).toEqual(403);
      expect(response?.body).toEqual({
        code: 'FST_CSRF_MISSING_SECRET',
        error: 'Forbidden',
        message: 'Missing csrf secret',
        statusCode: 403
      });
    });

    it('should return 403 if the csrf_token is invalid', async () => {
      const response = await request(fastifyTestInstance?.server)
        .put('/update-my-profileui')
        .set('Cookie', ['_csrf=foo', 'csrf-token=bar']);

      expect(response?.statusCode).toEqual(403);
      expect(response?.body).toEqual({
        code: 'FST_CSRF_INVALID_TOKEN',
        error: 'Forbidden',
        message: 'Invalid csrf token',
        statusCode: 403
      });
    });

    it('should receive a new CSRF token + secret in the response', async () => {
      const response = await request(fastifyTestInstance?.server).put(
        '/update-my-profileui'
      );

      const newCookies = response?.get('Set-Cookie');
      expect(newCookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining('_csrf'),
          expect.stringContaining('csrf_token')
        ])
      );
    });
  });

  describe('Authenticated user', () => {
    let setCookies: string[];

    // Authenticate user
    beforeAll(async () => {
      await fastifyTestInstance?.prisma.user.updateMany({
        where: { email: 'foo@bar.com' },
        data: { profileUI: baseProfileUI }
      });
      const res = await request(fastifyTestInstance?.server).get(
        '/auth/dev-callback'
      );
      setCookies = res.get('Set-Cookie');
    });

    describe('/update-my-profileui', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await superPut(
          '/update-my-profileui',
          setCookies
        ).send({
          profileUI
        });

        const user = await fastifyTestInstance?.prisma.user.findFirst({
          where: { email: 'foo@bar.com' }
        });

        expect(response?.statusCode).toEqual(200);
        expect(response?.body).toEqual({
          message: 'flash.privacy-updated',
          type: 'success'
        });
        expect(user?.profileUI).toEqual(profileUI);
      });

      test('PUT ignores invalid keys', async () => {
        const response = await superPut(
          '/update-my-profileui',
          setCookies
        ).send({
          profileUI: {
            ...profileUI,
            invalidKey: 'invalidValue'
          }
        });

        const user = await fastifyTestInstance?.prisma.user.findFirst({
          where: { email: 'foo@bar.com' }
        });

        expect(response?.statusCode).toEqual(200);
        expect(user?.profileUI).toEqual(profileUI);
      });

      test('PUT returns 400 status code with missing keys', async () => {
        const response = await superPut(
          '/update-my-profileui',
          setCookies
        ).send({
          profileUI: {
            isLocked: true,
            showName: true,
            showPoints: false,
            showPortfolio: true,
            showTimeLine: false
          }
        });

        expect(response?.statusCode).toEqual(400);
        expect(response?.body).toEqual({
          code: 'FST_ERR_VALIDATION',
          error: 'Bad Request',
          message: `body/profileUI must have required property 'showAbout'`,
          statusCode: 400
        });
      });
    });

    describe('/update-my-theme', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await superPut('/update-my-theme', setCookies).send({
          theme: 'night'
        });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.updated-themes',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid theme', async () => {
        const response = await superPut('/update-my-theme', setCookies).send({
          theme: 'invalid'
        });

        expect(response?.statusCode).toEqual(400);
      });
    });

    describe('/update-my-keyboard-shortcuts', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-keyboard-shortcuts')
          .set('Cookie', cookies)
          .send({ keyboardShortcuts: true });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.keyboard-shortcut-updated',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid shortcuts setting', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-keyboard-shortcuts')
          .set('Cookie', cookies)
          .send({ keyboardShortcuts: 'invalid' });

        expect(response?.statusCode).toEqual(400);
      });
    });

    describe('/update-my-quincy-email', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-quincy-email')
          .set('Cookie', cookies)
          .send({ sendQuincyEmail: true });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.subscribe-to-quincy-updated',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid sendQuincyEmail', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-quincy-email')
          .set('Cookie', cookies)
          .send({ sendQuincyEmail: 'invalid' });

        expect(response?.statusCode).toEqual(400);
      });
    });

    describe('/update-my-honesty', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-honesty')
          .set('Cookie', cookies)
          .send({ isHonest: true });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'buttons.accepted-honesty',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid honesty', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-honesty')
          .set('Cookie', cookies)
          .send({ isHonest: false });

        expect(response?.statusCode).toEqual(400);
      });
    });

    describe('/update-privacy-terms', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-privacy-terms')
          .set('Cookie', cookies)
          .send({ quincyEmails: true });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.privacy-updated',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with non-boolean data', async () => {
        const response = await request(fastify?.server)
          .put('/update-privacy-terms')
          .set('Cookie', cookies)
          .send({ quincyEmails: '123' });

        expect(response?.statusCode).toEqual(400);
        expect(response?.body).toEqual({
          code: 'FST_ERR_VALIDATION',
          error: 'Bad Request',
          message: 'body/quincyEmails must be boolean',
          statusCode: 400
        });
      });
    });
  });

  describe('Unauthenticated User', () => {
    let setCookies: string[];

    // Get the CSRF cookies from an unprotected route
    beforeAll(async () => {
      const res = await request(fastifyTestInstance?.server).get('/');
      setCookies = res.get('Set-Cookie');
    });

    test('PUT /update-my-profileui returns 401 status code for un-authenticated users', async () => {
      const response = await superPut('/update-my-profileui', setCookies);

      expect(response?.statusCode).toEqual(401);
    });

    test('PUT /update-my-theme returns 401 status code for un-authenticated users', async () => {
      const response = await superPut('/update-my-theme', setCookies);

      expect(response?.statusCode).toEqual(401);
    });

    test('PUT /update-privacy-terms returns 401 status code for un-authenticated users', async () => {
      const response = await request(fastify?.server).put(
        '/update-privacy-terms'
      );

      expect(response?.statusCode).toEqual(401);
    });
  });
});
