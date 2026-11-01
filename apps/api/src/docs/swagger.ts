export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Swap API Documentation',
    version: '2.0.0',
    description: 'Swap: Swap moments. Swap vibes. Production-Grade Social Media Platform with Waste of Time Reels, Swap Challenge Split-Screen Duets, Swap Day Mutual Matches, Vibe Swap Moods, Time Capsules, Streaks and Realtime Chat.',
    contact: {
      name: 'Swap Engineering Team',
      email: 'engineering@swap.app',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Service Health Check',
        responses: {
          200: { description: 'API is healthy' },
        },
      },
    },
    '/auth/signup': {
      post: {
        summary: 'Register new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  username: { type: 'string' },
                  name: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'username', 'name', 'password'],
              },
            },
          },
        },
        responses: { 201: { description: 'User created' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  login: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['login', 'password'],
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/posts': {
      get: {
        summary: 'Get paginated feed of posts',
        parameters: [
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'mood', in: 'query', schema: { type: 'string', enum: ['CHILL', 'FUNNY', 'MOTIVATED', 'CURIOUS'] } },
        ],
        responses: { 200: { description: 'Posts feed list' } },
      },
      post: {
        summary: 'Create a new post',
        responses: { 201: { description: 'Post created' } },
      },
    },
    '/reels': {
      get: {
        summary: 'Waste of Time: Ranked Reels Feed',
        responses: { 200: { description: 'Ranked reels feed' } },
      },
      post: {
        summary: 'Create a new reel',
        responses: { 201: { description: 'Reel created' } },
      },
    },
    '/swap/challenge': {
      post: {
        summary: 'Send a Swap Challenge to a friend with reel prompt',
        responses: { 201: { description: 'Challenge sent' } },
      },
    },
    '/swap/duets': {
      get: {
        summary: 'Get feed of split-screen Swap Duets',
        responses: { 200: { description: 'Duets feed' } },
      },
    },
    '/swap/day': {
      get: {
        summary: 'Get today random mutual-follow Swap Day match and partner highlights',
        responses: { 200: { description: 'Swap Day match' } },
      },
    },
    '/users/vibe': {
      put: {
        summary: 'Vibe Swap: Switch active vibe (CHILL, HYPE, FOCUS, DARK)',
        responses: { 200: { description: 'Active vibe updated' } },
      },
    },
    '/waste-time/dashboard': {
      get: {
        summary: 'Get Time Wasted Meter analytics dashboard & badges',
        responses: { 200: { description: 'Dashboard stats and procrastinator badges' } },
      },
    },
    '/capsules': {
      get: {
        summary: 'List user time capsules (auto-unlocking or locked countdown)',
        responses: { 200: { description: 'Time capsules' } },
      },
    },
  },
};
