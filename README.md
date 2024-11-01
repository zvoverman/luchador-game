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

## Getting Started

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

### Run Locally

### Deploy

COMING SOON!
