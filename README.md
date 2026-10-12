# Task Management REST API

A RESTful API for authenticated task management, developed for the AppRo8 Full Stack Developer Internship — Week 1–2, Task 1.

Users can register, log in, and create, retrieve, update, and delete their own tasks. The API validates incoming requests, hashes passwords, protects task routes with JWT authentication, isolates tasks by owner, and exposes interactive OpenAPI documentation.

## Technology stack

- Node.js 20+
- TypeScript
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens and bcrypt
- Zod request validation
- Swagger UI and OpenAPI 3
- Vitest, Supertest, and MongoDB Memory Server
- pnpm

## Prerequisites

Install the following before running the project locally:

- Node.js 20 or newer
- pnpm 10 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Local installation

```bash
git clone https://github.com/Oseni-Tomiwa/task-api.git
cd task-api
pnpm install
cp .env.example .env
```

Update `.env` with your local configuration, then start the development server:

```bash
pnpm dev
```

The default local API URL is `http://localhost:3000`.

## Environment variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `3000`. | `3000` |
| `MONGODB_URI` | Yes | MongoDB connection URI. | `mongodb://127.0.0.1:27017/task-api` |
| `JWT_SECRET` | Yes | Long, random secret used to sign JWTs. | `replace-with-a-long-random-secret` |
| `NODE_ENV` | No | Runtime environment. | `development` |

Never commit `.env` or real credentials. The tracked `.env.example` contains safe placeholders only.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the API in watch mode with TypeScript. |
| `pnpm test` | Run the Vitest test suite once. |
| `pnpm test:watch` | Run tests in watch mode. |
| `pnpm typecheck` | Check TypeScript without emitting files. |
| `pnpm build` | Compile production JavaScript into `dist/`. |
| `pnpm start` | Run the compiled production server. |

For a production-style local run:

```bash
pnpm build
pnpm start
```

The test suite uses MongoDB Memory Server, so it does not write to your local or hosted database. Its first run may download an isolated MongoDB binary.

## API endpoints

### General and authentication

| Method | Endpoint | Authentication | Success | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | No | `200` | Check whether the API is running. |
| `POST` | `/api/auth/register` | No | `201` | Register a user and receive a JWT. |
| `POST` | `/api/auth/login` | No | `200` | Log in and receive a JWT. |

Registration and login accept:

```json
{
  "email": "person@example.com",
  "password": "secure-password"
}
```

### Tasks

All task endpoints require `Authorization: Bearer <token>`. Users can access only their own tasks.

| Method | Endpoint | Success | Description |
| --- | --- | --- | --- |
| `POST` | `/api/tasks` | `201` | Create a task. |
| `GET` | `/api/tasks` | `200` | List the authenticated user's tasks. |
| `GET` | `/api/tasks/:taskId` | `200` | Retrieve one owned task. |
| `PATCH` | `/api/tasks/:taskId` | `200` | Update one owned task. |
| `DELETE` | `/api/tasks/:taskId` | `204` | Delete one owned task. |

A task contains:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Required. |
| `description` | string | Optional. |
| `status` | string | `pending`, `in-progress`, or `completed`; defaults to `pending`. |
| `createdAt` | ISO 8601 string | Generated automatically. |

The internal owner reference is never included in API responses.

## Testing authenticated requests

Register a user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"person@example.com","password":"secure-password"}'
```

Copy the `token` from the response and store it in your shell:

```bash
TOKEN='paste-token-here'
```

Use the token to create and list tasks:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Write the internship report","status":"in-progress"}'

curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

Missing, invalid, or expired tokens return `401`. Invalid request data returns `400`; tasks that do not exist or belong to another user return `404`.

## Swagger documentation

With the API running, open:

```text
http://localhost:3000/api/docs
```

The Swagger UI documents authentication, request bodies, response schemas, status codes, and all task operations. To try protected endpoints, select **Authorize** and enter the JWT returned by registration or login.

## Deploying to Render

1. Create a MongoDB Atlas database and copy its connection string.
2. Create a new Render **Web Service** connected to this repository.
3. Use `pnpm install --frozen-lockfile && pnpm build` as the build command.
4. Use `pnpm start` as the start command.
5. Add these environment variables in Render:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your MongoDB Atlas URI>`
   - `JWT_SECRET=<a long random production secret>`
6. Set the health check path to `/api/health`.

Render provides `PORT` automatically, so it does not need to be configured manually. Do not place production credentials in the repository.

## Project status

Implemented:

- User registration and login
- bcrypt password hashing
- JWT authentication
- Owner-scoped task CRUD
- Zod request validation
- Centralized error handling
- Swagger/OpenAPI documentation
- Automated endpoint tests
- Production build and start commands

Deployment has not been performed.

## License

MIT
