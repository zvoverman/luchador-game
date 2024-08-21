/**
 * import { io } from 'socket.io-client';
 *
 * TODO: (dev)
 * - use esbuild to bundle modules
 * - check types
 * - watch for frontend changes to ts files
 */
import { setupSocket } from './helpers/socket';
import { initializeGame } from './helpers/gameLogic';
import { initializeEventListeners } from './helpers/eventListener';

initializeGame('game-canvas');

// add input event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	initializeEventListeners();
});

setupSocket();
