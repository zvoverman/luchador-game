import { setupSocket } from './helpers/socket';
import { initializeGame } from './helpers/gameLogic';
import { initializeEventListeners } from './helpers/eventListener';

// start the game!
initializeGame('game-canvas');

// add input event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	initializeEventListeners();
});

// setup socket connections and listen for server messages
setupSocket();
