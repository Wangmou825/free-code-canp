import {
  Type,
  type FastifyPluginCallbackTypebox
} from '@fastify/type-provider-typebox';
import badWordsFilter from 'bad-words';
import { isValidUsername } from '../../../utils/validate';
// we have to use this file as JavaScript because it is used by the old api.
import { blocklistedUsernames } from '../../../config/constants.js';
export const settingRoutes: FastifyPluginCallbackTypebox = (
  fastify,
  _options,
  done
) => {
  // The order matters here, since we want to reject invalid cross site requests
  // before checking if the user is authenticated.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  fastify.addHook('onRequest', fastify.csrfProtection);
  fastify.addHook('onRequest', fastify.authenticateSession);

  fastify.put(
    '/update-my-profileui',
    {
      schema: {
        body: Type.Object({
          profileUI: Type.Object({
            isLocked: Type.Boolean(),
            showAbout: Type.Boolean(),
            showCerts: Type.Boolean(),
            showDonation: Type.Boolean(),
            showHeatMap: Type.Boolean(),
            showLocation: Type.Boolean(),
            showName: Type.Boolean(),
            showPoints: Type.Boolean(),
            showPortfolio: Type.Boolean(),
            showTimeLine: Type.Boolean()
          })
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.privacy-updated'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            profileUI: {
              isLocked: req.body.profileUI.isLocked,
              showAbout: req.body.profileUI.showAbout,
              showCerts: req.body.profileUI.showCerts,
              showDonation: req.body.profileUI.showDonation,
              showHeatMap: req.body.profileUI.showHeatMap,
              showLocation: req.body.profileUI.showLocation,
              showName: req.body.profileUI.showName,
              showPoints: req.body.profileUI.showPoints,
              showPortfolio: req.body.profileUI.showPortfolio,
              showTimeLine: req.body.profileUI.showTimeLine
            }
          }
        });

        return {
          message: 'flash.privacy-updated',
          type: 'success'
        } as const;
      } catch (err) {
        // TODO: send to Sentry
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-theme',
    {
      schema: {
        body: Type.Object({
          theme: Type.Union([Type.Literal('default'), Type.Literal('night')])
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.updated-themes'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            theme: req.body.theme
          }
        });

        return {
          message: 'flash.updated-themes',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-socials',
    {
      schema: {
        body: Type.Object({
          website: Type.Optional(Type.String({ format: 'url' })),
          twitter: Type.Optional(Type.String({ format: 'url' })),
          githubProfile: Type.Optional(Type.String({ format: 'url' })),
          linkedin: Type.Optional(Type.String({ format: 'url' }))
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.updated-socials'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            website: req.body.website,
            twitter: req.body.twitter,
            githubProfile: req.body.githubProfile,
            linkedin: req.body.linkedin
          }
        });

        return {
          message: 'flash.updated-socials',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-username',
    {
      schema: {
        body: Type.Object({
          username: Type.String({ minLength: 3, maxLength: 20 })
        }),
        response: {
          200: Type.Object({
            message: Type.String(),
            type: Type.Union([Type.Literal('success'), Type.Literal('info')]),
            username: Type.String()
          }),
          500: Type.Object({
            message: Type.String(),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        const user = await fastify.prisma.user.findFirst({
          where: { id: req.session.user.id }
        });

        const newUsername = req.body.username.toLowerCase();
        const oldUsername = user?.username.toLowerCase();

        const newUsernameDisplay = req.body.username.trim();
        const oldUsernameDisplay = user?.usernameDisplay?.trim();

        const alreadyUsername =
          newUsername === oldUsername &&
          newUsernameDisplay === oldUsernameDisplay;

        if (alreadyUsername && oldUsernameDisplay) {
          return {
            message: 'flash.username-used',
            type: 'info',
            username: newUsername
          } as const;
        }

        const validation = isValidUsername(newUsername);

        if (!validation.valid) {
          return {
            message: `Username ${newUsername} ${validation.error}`,
            type: 'info',
            username: newUsername
          } as const;
        }

        const hasProfanity = new badWordsFilter().isProfane(newUsername);
        const preserved = blocklistedUsernames.includes(newUsername);

        // Checks for both username and usernameDisplay because users
        // can have the same username but with differnt casing

        const exists = await fastify.prisma.user.findFirst({
          where: { username: newUsername, usernameDisplay: newUsernameDisplay }
        });

        if (exists || hasProfanity || preserved) {
          return {
            message: 'flash.username-taken',
            type: 'info',
            username: newUsername
          } as const;
        }

        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            username: req.body.username,
            usernameDisplay: newUsernameDisplay
          }
        });

        return {
          message: 'flash.username-updated',
          type: 'success',
          username: newUsername
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-keyboard-shortcuts',
    {
      schema: {
        body: Type.Object({
          keyboardShortcuts: Type.Boolean()
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.keyboard-shortcut-updated'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            keyboardShortcuts: req.body.keyboardShortcuts
          }
        });

        return {
          message: 'flash.keyboard-shortcut-updated',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-quincy-email',
    {
      schema: {
        body: Type.Object({
          sendQuincyEmail: Type.Boolean()
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.subscribe-to-quincy-updated'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            sendQuincyEmail: req.body.sendQuincyEmail
          }
        });

        return {
          message: 'flash.subscribe-to-quincy-updated',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-my-honesty',
    {
      schema: {
        body: Type.Object({
          isHonest: Type.Literal(true)
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('buttons.accepted-honesty'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            isHonest: req.body.isHonest
          }
        });

        return {
          message: 'buttons.accepted-honesty',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  fastify.put(
    '/update-privacy-terms',
    {
      schema: {
        body: Type.Object({
          quincyEmails: Type.Boolean()
        }),
        response: {
          200: Type.Object({
            message: Type.Literal('flash.privacy-updated'),
            type: Type.Literal('success')
          }),
          500: Type.Object({
            message: Type.Literal('flash.wrong-updating'),
            type: Type.Literal('danger')
          })
        }
      }
    },
    async (req, reply) => {
      try {
        await fastify.prisma.user.update({
          where: { id: req.session.user.id },
          data: {
            acceptedPrivacyTerms: true,
            sendQuincyEmail: req.body.quincyEmails
          }
        });

        return {
          message: 'flash.privacy-updated',
          type: 'success'
        } as const;
      } catch (err) {
        fastify.log.error(err);
        void reply.code(500);
        return { message: 'flash.wrong-updating', type: 'danger' } as const;
      }
    }
  );

  done();
};
