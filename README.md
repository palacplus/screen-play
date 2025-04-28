# ScreenPlay

ScreenPlay is an all-in-one home movie library management system designed to give users the nostalgic feeling of browsing through a video store. It provides a shared movie library interface for managing movies in Plex, allowing users to log in, review the current selection of movies, report issues with titles, and request new movies to be added to the library.

## Features

- **Browse Movies**: Explore the shared movie library with a video store-like interface.
- **Report Issues**: Users can report problems with any of the available titles.
- **Request Movies**: Easily request new movies to be added to the library.
- **User Authentication**: Secure login system for managing user access.
- **Admin Tools**: Manage movie requests, reported issues, and library updates.

---

## Application Architecture

ScreenPlay is split into two main components:

### 1. **Frontend**

- **Technology**: Written in TypeScript/Javascript using the React framework.
- **Purpose**: Provides the user interface for browsing the movie library, reporting issues, and requesting new movies.
- **Docker**: The frontend can be built into a Docker image using the provided `Dockerfile.client`.

### 2. **Backend**

- **Technology**: A .NET web application written in C#.
- **Purpose**: Handles user authentication, movie library management, and API endpoints for the frontend.
- **Docker**: The backend can be built into a Docker image using the provided `Dockerfile.server`.

---

## Building the Application

### Prerequisites

- Docker installed on your system.
- Node.js and npm (for local frontend development).
- .NET SDK (for local backend development).

### Building the Docker Images

```bash
docker build -t -f Dockerfile.client screenplay-frontend .
docker build -t -f Dockefile.server screenplay-backend .
```

---

## Deployment

ScreenPlay is configured for deployment using GitHub Actions. The CI/CD pipeline ensures a production-like environment with the following steps:

1. Build and Test:

- The frontend and backend are built and tested in isolated environments.
- Unit tests and integration tests are executed to ensure code quality.

2. Docker Image Creation:

- Docker images for both the frontend and backend are built and pushed to the GitHub Container Registry (GHCR).

3. Deployment:

- The application is deployed to a production-like environment using the built Docker images.

---

## Testing

ScreenPlay includes automated tests to ensure the application works as expected:

- Frontend Tests:

  - Written using Playwright for end-to-end testing.
  - Tests cover user interactions like login, movie browsing, and reporting issues.

- Backend Tests:
  - Written using xUnit for unit and integration testing.
  - Tests cover API endpoints, authentication, and database interactions.

The GitHub Actions pipeline runs these tests automatically on every push or pull request to ensure the application remains stable.

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request for review.

---

## License

ScreenPlay is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for more details.
