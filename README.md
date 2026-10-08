Task Management REST API

A RESTful API for managing tasks, built with Node.js, Express, TypeScript, MongoDB, and Mongoose.

Developed as part of the AppRo8 Full Stack Developer Internship — Week 1–2, Task 1: REST API Development.

Overview

This project aims to provide a secure, maintainable backend service for creating, retrieving, updating, and deleting tasks.

The API will include authentication, request validation, centralized error handling, and interactive API documentation.

Tech Stack

* Runtime: Node.js
* Language: TypeScript
* Framework: Express.js
* Database: MongoDB
* ODM: Mongoose
* Authentication: JSON Web Tokens (JWT)
* Validation: Zod
* Documentation: Swagger / OpenAPI
* Testing: Vitest and Supertest

Planned Features

* [ ]	User registration and login
* [ ]	JWT authentication
* [ ]	Create, retrieve, update, and delete tasks
* [ ]	Task ownership and protected routes
* [ ]	Request validation
* [ ]	Centralized error handling
* [ ]	Appropriate HTTP status codes
* [ ]	Swagger/OpenAPI documentation
* [ ]	Automated API tests
* [ ]	Production deployment

Task Model

Field	Type	Description
title	String	Task title
description	String	Optional task details
status	String	Task progress status
createdAt	Date	Task creation timestamp

Additional fields may be introduced for task ownership and maintenance.

Planned API Endpoints

Method	Endpoint	Description
POST	/api/auth/register	Register a user
POST	/api/auth/login	Authenticate a user
GET	/api/tasks	Retrieve tasks
GET	/api/tasks/:id	Retrieve a task
POST	/api/tasks	Create a task
PATCH	/api/tasks/:id	Update a task
DELETE	/api/tasks/:id	Delete a task
GET	/api/health	Health check

Getting Started

Installation and local development instructions will be added when the project setup is complete.

Environment Variables

An .env.example file will document the required environment variables without exposing secrets.

API Documentation

Swagger/OpenAPI documentation will be available after implementation.

Deployment

Deployment URL: Coming soon.

Project Status

In Progress — Initial Setup

Internship

Organization: AppRo8
Program: Full Stack Developer Internship
Assignment: Week 1–2, Task 1
Submission Deadline: October 24, 2026

License

MIT License.
