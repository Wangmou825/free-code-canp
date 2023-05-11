import request from 'supertest';

import { build } from '../app';

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
  let fastify: undefined | Awaited<ReturnType<typeof build>>;

  beforeAll(async () => {
    fastify = await build();
    await fastify.ready();
  }, 20000);

  afterAll(async () => {
    await fastify?.close();
  });

  describe('Authenticated user', () => {
    let cookies: string[];

    beforeAll(async () => {
      await fastify?.prisma.user.updateMany({
        where: { email: 'foo@bar.com' },
        data: { profileUI: baseProfileUI }
      });
      const res = await request(fastify?.server).get('/auth/dev-callback');
      cookies = res.get('Set-Cookie');
    });

    describe('/update-my-profileui', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-profileui')
          .set('Cookie', cookies)
          .send({ profileUI });

        const user = await fastify?.prisma.user.findFirst({
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
        const response = await request(fastify?.server)
          .put('/update-my-profileui')
          .set('Cookie', cookies)
          .send({
            profileUI: {
              ...profileUI,
              invalidKey: 'invalidValue'
            }
          });

        const user = await fastify?.prisma.user.findFirst({
          where: { email: 'foo@bar.com' }
        });

        expect(response?.statusCode).toEqual(200);
        expect(user?.profileUI).toEqual(profileUI);
      });

      test('PUT returns 400 status code with missing keys', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-profileui')
          .set('Cookie', cookies)
          .send({
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
          error: 'Bad Request',
          message: `body/profileUI must have required property 'showAbout'`,
          statusCode: 400
        });
      });
    });

    describe('/update-my-theme', () => {
      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-theme')
          .set('Cookie', cookies)
          .send({ theme: 'night' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.updated-themes',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid theme', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-theme')
          .set('Cookie', cookies)
          .send({ theme: 'invalid' });

        expect(response?.statusCode).toEqual(400);
      });
    });

    describe('/update-my-username', () => {
      test('PUT returns an error when the username is already used', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'twaha' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.username-taken',
          type: 'info'
        });
      });

      test('PUT returns an error when the username uses special characters', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'twaha@' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'Username twaha@ contains invalid characters',
          type: 'info'
        });
      });

      test('PUT returns an error when the username is an endpoint', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'german' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.username-taken',
          type: 'info'
        });
      });

      test('PUT returns an error when the username is a bad word', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'ass' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.username-taken',
          type: 'info'
        });
      });

      test('PUT returns an error when the username is a https status code', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: '404' });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'Username 404 is a reserved error code',
          type: 'info'
        });
      });

      test('PUT returns an error when the username is shorter than 3 characters', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'fo' });

        expect(response?.statusCode).toEqual(400);

        expect(response?.body).toEqual({
          error: 'Bad Request',
          message: 'body/username must NOT have fewer than 3 characters',
          statusCode: 400
        });
      });

      test('PUT returns 200 status code with "success" message', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: (Math.random() + 1).toString(36).substring(7) });

        expect(response?.statusCode).toEqual(200);

        expect(response?.body).toEqual({
          message: 'flash.username-updated',
          type: 'success'
        });
      });

      test('PUT returns 400 status code with invalid username', async () => {
        const response = await request(fastify?.server)
          .put('/update-my-username')
          .set('Cookie', cookies)
          .send({ username: 'thisusernameiswaytolongforuse' });

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
  });

  describe('Unauthenticated User', () => {
    test('PUT /update-my-profileui returns 401 status code for un-authenticated users', async () => {
      const response = await request(fastify?.server).put(
        '/update-my-profileui'
      );

      expect(response?.statusCode).toEqual(401);
    });

    test('PUT /update-my-theme returns 401 status code for un-authenticated users', async () => {
      const response = await request(fastify?.server).put('/update-my-theme');

      expect(response?.statusCode).toEqual(401);
    });

    test('PUT /update-my-username returns 401 status code for un-authenticated users', async () => {
      const response = await request(fastify?.server).put(
        '/update-my-username'
      );

      expect(response?.statusCode).toEqual(401);
    });
  });
});
