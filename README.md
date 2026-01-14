# VaporShare Backend

VaporShare is a secure and performant backend service built with TypeScript and Express to handle file management and user authentication.

## 🔄 User Workflow Summary

1.  **Authentication**: Users register and login via [`user.controller.ts`](src/controllers/user.controller.ts) to receive access tokens for authenticated sessions.
2.  **Secure Access**: Protected routes are accessed using the [`auth.middleware.ts`](src/middlewares/auth.middleware.ts), ensuring data privacy.
3.  **File Management**: Authenticated users can upload, manage, and share assets as defined by the [`file.ts`](src/models/file.ts) model.

## 🛠️ Technical Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](src/app.ts)
- **Language**: [TypeScript](tsconfig.json)
- **Utilities**: Integrated [logger](src/utils/logger.ts) and standardized [API responses](src/utils/ApiResponse.ts).

## 🚀 Quick Start

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Setup Environment**:
    Create a `.env` file based on [`.env.example`](.env.example).
3.  **Run Development Server**:
    ```bash
    pnpm run dev
    ```

## 📁 Project Highlights

- **Middleware Driven**: Robust [`error.middleware.ts`](src/middlewares/error.middleware.ts) for centralized handling.
- **Structured Utils**: Uses [`asyncHandler.ts`](src/utils/asyncHandler.ts) to simplify asynchronous route logic.
- **Database**: Managed through [`db.ts`](src/db.ts).

---

_Created by [RoboXGamer](https://github.com/RoboXGamer/VaporShareBackend)._
