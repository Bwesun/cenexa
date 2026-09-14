# Cenexa Exam Backend

A secure, role-based backend service for managing exam creation, question delivery, candidate assessment, and result reporting. The service is built with Node.js, Express, MongoDB, and JWT-based authentication, and exposes a Swagger-driven API surface for developers and administrators.

## 1. Overview

The Cenexa Exam Backend is the API layer that powers a multi-tenant exam platform. It serves several user roles:

- Super Admin
- Organization Admin
- Examiner
- Candidate

The platform supports:

- Organization-aware access control
- User registration and account authentication
- Password reset via email
- Exam lifecycle management
- Question management and bulk question upload
- Candidate exam initiation, answering, and submission
- Automated scoring and result aggregation
- Swagger API documentation

## 2. Solution Goals

This backend is designed to provide:

- Strong authentication and authorization boundaries
- Organization isolation so data is scoped to the authenticated organization
- Scalable exam administration workflows
- Candidate-friendly exam attempt handling with answer persistence
- Audit-friendly result and analytics endpoints for admins

## 3. Technology Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JWT
- Security: Helmet, CORS, express-rate-limit
- File handling: Multer
- Email: Nodemailer
- API docs: Swagger UI + Swagger JSDoc
- QR generation: qrcode

## 4. Project Structure

```text
exampro_backend/
├── controllers/
│   └── question.controller.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── validate.js
├── models/
│   ├── CandidateExam.js
│   ├── ExamCounter.js
│   ├── Exams.js
│   ├── Organization.js
│   ├── OrganizationCounter.js
│   ├── QuestionCounter.js
│   ├── Questions.js
│   ├── Results.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── candidateExam.js
│   ├── exam.js
│   ├── organization.js
│   ├── question.js
│   ├── result.js
│   ├── user.js
│   └── verification.js
├── services/
├── uploads/
├── utils/
├── validators/
├── server.js
├── swagger.js
└── package.json
```

## 5. Core Runtime Flow

The application boots from [server.js](server.js) and performs the following startup sequence:

1. Load environment variables from `.env`
2. Initialize Express application and middleware
3. Connect to MongoDB using Mongoose
4. Register API routes
5. Expose Swagger documentation at `/api`
6. Start listening on the configured port

## 6. Authentication and Authorization Model

### JWT Authentication

Every protected endpoint expects a bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

The `authenticate` middleware verifies the token and populates `req.user` with the authenticated identity.

### Role-Based Access Control

Supported roles:

| Role | Access Summary |
| --- | --- |
| `super` | Platform-wide access for system administration and organization management |
| `admin` | Scoped to the authenticated organization |
| `examiner` | Manage exams and questions created within their organization |
| `candidate` | Initiate and submit exams and view own results |

The `authorize(...roles)` middleware enforces role checks on route handlers.

## 7. API Surface Summary

### Authentication

- `POST /api/auth/register`
  - Create a user within the authenticated organization
- `POST /api/auth/login`
  - Login using `ranNo` and `password`
- `GET /api/auth/me`
  - Retrieve the current authenticated profile
- `PUT /api/auth/profile`
  - Update the current user's profile
- `POST /api/auth/forgot-password`
  - Send a reset email
- `POST /api/auth/reset-password`
  - Reset the user's password using a token

### Organization Administration

- `GET /api/organization/all`
- `POST /api/organization/create`
- `GET /api/organization/:id`
- `PUT /api/organization/:id`
- `DELETE /api/organization/:id`

### Exam Management

- `GET /api/exam`
- `POST /api/exam/create`
- `GET /api/exam/:id`
- `PUT /api/exam/:id`
- `DELETE /api/exam/:id`

Exam creation includes automatic QR code generation and unique exam code assignment.

### Question Management

- `GET /api/question/admin-questions/:examId`
- `GET /api/question/examiner-questions/:examId`
- `POST /api/question/add-question/:examId`
- `GET /api/question/exam/:examId`
- `GET /api/question/download-template`
- `GET /api/question/:id`
- `PUT /api/question/:id`

### Candidate Exam Flow

- `GET /api/candidate/get-question/:questionId`
- `GET /api/candidate/candidate-exam/:candidateExamId`
- `POST /api/candidate/initiate/:examId`
- `PATCH /api/candidate/save/:candidateExamId`
- `PATCH /api/candidate/submit/:candidateExamId`

This flow is responsible for:

1. Creating a candidate exam attempt
2. Randomizing questions when needed
3. Persisting answer selections
4. Scoring and producing a final result record

### Result Management

- `GET /api/result/candidate/my-results`
- `GET /api/result/:resultId`
- `GET /api/result/exam/:examId/stats`
- `GET /api/result/exam/:examId/all`
- `GET /api/result/exam/broadsheet/:examId`

### User Administration

- `GET /api/user/super`
- `GET /api/user/admin`
- `GET /api/user/:id`
- `PUT /api/user/super/:id`
- `DELETE /api/user/super/:id`
- `POST /api/user/super/create-admin`
- `POST /api/user/admin/create-user`

### Admin Dashboard and Health

- `GET /api/admin/dashboard-stats`
- `GET /api/admin/system/health`

## 8. Core Data Model

### User

The central actor model contains:

- `name`
- `email`
- `password`
- `ranNo`
- `role`
- `phone`
- `association`
- `conference`
- `organizationId`
- `isActive`
- `isVerified`

Passwords are automatically hashed using bcrypt during `save`.

### Organization

An organization is the tenant boundary for user and exam data.

### Exam

Exam records include:

- `title`
- `description`
- `examCode`
- `examNumber`
- `duration`
- `numberOfQuestions`
- `instructions`
- `totalMark`
- `passingMark`
- `scheduleStart`
- `scheduleEnd`
- `status`
- `qrCode`
- `organizationId`
- `createdBy`

### Question

Questions contain:

- `text`
- `options[]`
- `exam`
- `organizationId`
- `createdBy`
- `questionCode`
- `questionNumber`
- `status`

Schema-level validation ensures a question has at least two options and exactly one correct answer.

### CandidateExam

Represents a candidate's attempt instance for an exam, including:

- `candidate`
- `exam`
- `organizationId`
- `questionAnswers[]`
- `isSubmitted`
- `score`
- `totalAttempted`
- `totalCorrect`
- `totalIncorrect`
- `totalBlank`
- `percentage`
- `passed`

### Result

Results are persisted after exam submission and include final scoring and pass/fail metadata.

## 9. Security Considerations

This service implements several safety controls:

- JWT authorization on protected routes
- Role-based endpoint restrictions
- Organization scoping for tenant isolation
- Helmet middleware for security headers
- CORS enabled at the API boundary
- Global rate limiting to reduce abuse
- Password hashing via bcrypt
- Input validation on common auth and request flows

### Recommended Operational Security Practices

- Rotate `JWT_SECRET` regularly
- Keep MongoDB credentials in a secret manager or environment-only configuration
- Restrict CORS origins in production
- Avoid exposing raw stack traces in production responses
- Use an SMTP provider with proper credentials and domain validation

## 10. Environment Variables

Create a `.env` file at the project root with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cenexa
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
```

### Variable Notes

- `PORT`: Port used by the Express service
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Signing secret for access tokens
- `FRONTEND_URL`: Used for password reset links
- SMTP settings power password reset email delivery

## 11. Installation and Setup

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Run in production mode

```bash
npm start
```

## 12. Swagger Documentation

Swagger is served directly by the backend:

- Local: `http://localhost:<PORT>/api`

This is the primary interactive API documentation endpoint and should be used by frontend and QA engineers during development.

## 13. API Design Notes

The backend follows a RESTful style and returns consistent JSON responses in the following pattern:

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

Error responses typically return:

```json
{
  "success": false,
  "message": "...",
  "error": "..."
}
```

## 14. Typical Business Workflow

A standard candidate flow looks like this:

1. Candidate logs in
2. Candidate requests exam initiation via `POST /api/candidate/initiate/:examId`
3. Candidate receives a `candidateExamId`
4. Candidate answers questions using `PATCH /api/candidate/save/:candidateExamId`
5. Candidate submits the assessment using `PATCH /api/candidate/submit/:candidateExamId`
6. Result is generated and saved for reporting and analytics

## 15. Operational Recommendations

### Development

- Use a local MongoDB instance during development
- Keep Swagger enabled for generated docs verification
- Validate all role-sensitive routes with a real JWT token before merge

### Production

- Add CI checks for linting and request validation coverage
- Harden rate limiting and origin restrictions
- Use a dedicated production database and secrets manager
- Add request-level logging and observability

## 16. Known Implementation Notes

Some parts of the service are still under active refinement and should be treated as evolving API contracts:

- Several routes rely on organization-scoped authorization and current authenticated user context
- Some admin route areas remain partially commented or in a draft state
- Swagger annotations are present for many routes but should be reviewed for completeness as the API stabilizes

## 17. Contribution Guidance

When extending the service:

- Keep per-organization access control intact
- Prefer the existing `authenticate` and `authorize` middleware
- Add input validation before persisting data
- Document new endpoints in Swagger comments
- Preserve consistent JSON success/error response patterns

## 18. Summary

The Cenexa Exam Backend is a multi-role examination platform API that combines authentication, organization tenancy, exam delivery, candidate answer capture, scoring, and reporting in a single service. It is well-structured for further expansion, especially as the front-end and reporting workflows evolve.

For local development, start with the configuration steps above, launch the server with `npm run dev`, and interact with the live API contract through the Swagger page at `/api`.
