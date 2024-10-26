import { emitMessage, setupSocket } from './helpers/socket';
import { initializeGame } from './helpers/gameLogic';
import { initializeEventListeners } from './helpers/eventListener';

// start the game!
initializeGame('game-canvas');

// add input event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	initializeEventListeners();

	const joinButton = document.getElementById('usernameButton');
	if (joinButton) {
		joinButton.addEventListener('click', setUsername);
	}

	// Load the username from localStorage if available
	const savedUsername = localStorage.getItem('username');
});

// setup socket connections and listen for server messages
setupSocket();

/**
 *
 * USERNAME INPUT CODE
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

function setUsername() {
	const usernameElement: HTMLInputElement | null = document.getElementById(
		'username'
	) as HTMLInputElement;

	if (usernameElement === null) {
		console.error('Username element cannot be found in the DOM');
		return false;
	}

	const userInput: string = usernameElement.value;

	if (userInput === '' || userInput === null) return;

	emitMessage('setUsername', { userInput });
}

export function displayGame() {
	// Hide the username screen and show the game screen
	const usernameScreen = document.getElementById('usernameScreen');
	if (usernameScreen != null) {
		usernameScreen.style.display = 'none';
	}

	const gameScreen = document.getElementById('gameScreen');
	if (gameScreen != null) {
		gameScreen.style.display = 'block';
	}
}
