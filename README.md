# Luchador Game

Responsive server-authoritative game architecture written in TypeScript.

## About

### Technologies

-   [Node.js](https://nodejs.org/en)
-   [Express](https://expressjs.com/)
-   [Socket.io](https://socket.io/)

### Design Philosophy

> **Objective: Build a server-authoritative game architecture that maintains smooth, responsive movement, even over high-latency networks.**

To achieve this, the game employs the following concepts:

-   **Server Authoritative Gameplay**: The server validates and controls all game state, ensuring fair and consistent play.
-   **Server Reconciliation**: Corrects discrepancies between the client and server states by adjusting the client's view.
-   **Client-side Prediction**: Anticipates player actions locally, creating a seamless experience on the client side.
-   **Input Sanitation and Validation**: Ensures that only valid and non-malicious inputs affect gameplay.

### Disclaimers

**Socket.io and Speed**: While Socket.io simplifies real-time communication, it has speed limitations. Ideally, this game would use a custom UDP-based protocol for optimal performance, but that is beyond the scope of this project.

## Development

### Prerequisites

-   [**Node.js**](https://nodejs.org/en)
-   [**npm**](https://www.npmjs.com/)

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

#### Production Build

To build and run the application in production mode:

1. **Build the project**:

    ```bash
    npm run build
    ```

2. **Run the production server**:

    ```bash
    npm run start
    ```

#### Access the Game

After running either the development or production build, you can access the game in your browser at: http://localhost:3000

## Deployment

...
