# Luchador Game

Responsive server-authoritative game architecture written in TypeScript.

## About

Luchador Game is a server-authoritative, 2D multiplayer fighting game that aims to provide smooth and responsive gameplay across high-latency networks. Set in a lucha libre-inspired world, players battle using real-time physics with friction and gravity, all managed by a TypeScript-based server.

### Technologies

-   [Node.js](https://nodejs.org/en): Backend framework for the server.
-   [Express](https://expressjs.com/): Middleware for serving static files.
-   [Socket.io](https://socket.io/): Manages real-time, bidirectional communication between client and server.

### Design Philosophy

> **Objective: Build a server-authoritative game that maintains smooth, responsive movement, even over high-latency networks.**

To achieve this, the game's architecture employs the following concepts:

-   **Server Authoritative Gameplay**: The server validates and controls all game state, ensuring fair and consistent play.
-   **Server Reconciliation**: Corrects discrepancies between the client and server states by adjusting the client's view.
-   **Client-side Prediction**: Anticipates player actions locally, creating a seamless experience on the client side.
-   **Input Sanitation and Validation**: Ensures that only valid and non-malicious inputs affect gameplay.

### Disclaimers

**Socket.io and Speed**: While Socket.io simplifies real-time communication, it’s limited in speed due to its WebSocket and fallback-based architecture. Ideally, this game would use a custom packet protocol over UDP for optimal performance, but that is out of this project’s scope.

### Prerequisites

-   **Node.js** (v20 or later recommended)
-   **npm** (Node package manager, included with Node.js)

To check if these are installed, run:

```bash
node -v
npm -v
```

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/zvoverman/luchador-game.git
    cd luchador-gamme
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

### Running the Application Locally

This project has various `npm` scripts for development, production, and testing environments.

#### Development Build

For development, use the following command to run both the server and client with hot-reloading:

```bash
npm run dev
```

This command does the following:

-   **Client**: Starts a TypeScript type-checking process (`dev:client:typecheck`) and an `esbuild` watcher to bundle client code on changes (`dev:client:bundle`).
-   **Server**: Uses `ts-node-dev` to watch and re-run the server code on changes (`dev:server`).

#### Testing with Simulated Lag

To simulate network latency during development, run:

```bash
npm run dev:fakelag
```

This command sets the `FAKE_LAG=true` environment variable, which you can use in your server code to introduce artificial delays.

#### Production Build

To build and run the application in production mode:

1. **Build the project**:

    ```bash
    npm run build
    ```

    This command does the following:

    - Type-checks the client code and bundles it with `esbuild` into the `dist/client` folder.
    - Compiles the server code into the `dist/server` folder using the `tsconfig.server.json` configuration file.

2. **Run the production server**:

    ```bash
    npm run start
    ```

    This script sets `NODE_ENV=production` and starts the server from the `dist/server/server.js` file.

#### Access the Game

After running either the development or production build, you can access the game in your browser at: http://localhost:3000

### Deployment

COMING SOON
