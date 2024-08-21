import http, { request } from 'http';
import app from './app';
import { setupSocket } from './socket';
import { gameLoop } from './game';
import { FAKE_LAG, LATENCY } from './common/constants';

const server = http.createServer(app);
setupSocket(server);

setInterval(gameLoop, 15); // 60 fps

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(
		`${FAKE_LAG ? 'Server with ' + LATENCY + ' ms of latency' : 'Server'} is running on http://localhost:${PORT}`
	);
});
