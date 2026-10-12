export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AppRo8 Task Management API',
    version: '1.0.0',
    description: 'REST API for authenticated task management.',
  },
  tags: [
    { name: 'Health', description: 'Service health' },
    { name: 'Authentication', description: 'User registration and login' },
    { name: 'Tasks', description: 'Authenticated task operations' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      AuthRequest: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', example: 'person@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 72 },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          email: { type: 'string', format: 'email', example: 'person@example.com' },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT bearer token' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      TaskStatus: {
        type: 'string',
        enum: ['pending', 'in-progress', 'completed'],
      },
      Task: {
        type: 'object',
        required: ['id', 'title', 'status', 'createdAt'],
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          title: { type: 'string', example: 'Write the internship report' },
          description: { type: 'string', example: 'Summarize the completed API work.' },
          status: { $ref: '#/components/schemas/TaskStatus' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        additionalProperties: false,
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          status: {
            allOf: [{ $ref: '#/components/schemas/TaskStatus' }],
            default: 'pending',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          status: { $ref: '#/components/schemas/TaskStatus' },
        },
      },
    },
    parameters: {
      TaskId: {
        name: 'taskId',
        in: 'path',
        required: true,
        description: 'MongoDB task identifier',
        schema: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}$',
          example: '507f1f77bcf86cd799439011',
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid request data',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      Unauthorized: {
        description: 'Authentication failed or is required',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      Conflict: {
        description: 'Email is already registered',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      InternalServerError: {
        description: 'Unexpected server error',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', enum: ['ok'] } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AuthRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'User registered',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { $ref: '#/components/responses/Conflict' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in a user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AuthRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'User authenticated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'List the authenticated user tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/tasks/{taskId}': {
      parameters: [{ $ref: '#/components/parameters/TaskId' }],
      get: {
        tags: ['Tasks'],
        summary: 'Get one owned task',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update an owned task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete an owned task',
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'Task deleted' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
};
