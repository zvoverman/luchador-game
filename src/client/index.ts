import {
	emitMessage,
	setupSocket,
	validateUsernameAck,
} from './helpers/socket';
import { initializeGame } from './helpers/gameLogic';
import { initializeEventListeners } from './helpers/eventListener';
import { ClientToServerEvent } from './common/types';

// setup socket connections and listen for server messages
setupSocket();

// start the game!
initializeGame('game-canvas');

// add input event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	initializeEventListeners();
	hideError();

	const usernameFormElement = document.getElementById('usernameForm');
	if (usernameFormElement) {
		usernameFormElement.addEventListener('submit', setUsername);
	}
});

// Username Input Code
function setUsername(e: SubmitEvent) {
	// don't refresh page on form submission
	e.preventDefault();

	const usernameElement: HTMLInputElement | null = document.getElementById(
		'username'
	) as HTMLInputElement;

	if (usernameElement === null) {
		console.error('Username element cannot be found in the DOM');
		return false;
	}

	const userInput: string = usernameElement.value;

	if (userInput === '' || userInput === null) return;

	emitMessage(
		ClientToServerEvent.VALIDATE_USERNAME,
		{ userInput },
		validateUsernameAck
	);
}

export function displayGame() {
	// Hide error message if shown
	hideError();

	// Hide the username screen and show the game screen
	hideUsernameScreen();
	displayGameScreen();
}

/**
 * 		Display/Hide DOM Elements
 */
export function displayUsernameScreen() {
	const usernameScreen = document.getElementById('usernameScreen');
	if (usernameScreen != null) {
		usernameScreen.style.display = 'block';
	}
}

export function hideUsernameScreen() {
	const usernameScreen = document.getElementById('usernameScreen');
	if (usernameScreen != null) {
		usernameScreen.style.display = 'none';
	}
}

export function displayGameScreen() {
	const gameScreen = document.getElementById('gameScreen');
	if (gameScreen != null) {
		gameScreen.style.display = 'flex';
	}
}

export function hideGameScreen() {
	const gameScreen = document.getElementById('gameScreen');
	if (gameScreen != null) {
		gameScreen.style.display = 'none';
	}
}

export function displayError() {
	const errorMessage = document.getElementById('errorMessage');
	if (errorMessage != null) {
		errorMessage.style.display = 'flex';
	}
}

export function hideError() {
	const errorMessage = document.getElementById('errorMessage');
	if (errorMessage != null) {
		errorMessage.style.display = 'none';
	}
}
