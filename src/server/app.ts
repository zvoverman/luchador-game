import express from 'express';
import path from 'path';

const app = express();

// middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// serve static js files from /public/js directory
app.use(
	'/js',
	express.static(path.join(__dirname, '../../dist/client/'), {
		index: false,
	})
);

// serve static non-js files from /public directory
app.use(express.static(path.join(__dirname, '../../public')));

// serve index.html from root only to
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Serve a different HTML page for the game
app.get('/game', (req, res) => {
	res.sendFile(path.join(__dirname, '../../public', 'game.html'));
});

app.get('*', (req, res) => {
	res.status(404).sendFile(path.join(__dirname, '../../public', '404.html'));
});

let playerName = '';

// Handle form submission
app.post('/save-username', (req, res) => {
	// playerName = req.body.username; // Save the player's username
	// console.log(`Player's username is: ${playerName}`);
	res.redirect('/game'); // Redirect to the game page
});

export default app;
