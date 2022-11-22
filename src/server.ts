/**
 * Server handling!
 */
// @ts-ignore
import * as ws from 'ws';
import {User} from './user';

export const server = new ws.Server({
    port: 8060,
    path: '/ws',
});
server.on('connection', (socket, req) => {
    const user = new User(socket, req);
    let failures = 0;
    // console.log('connected: ' + user.ip);
    socket.on('message', data => {
        // console.log('message: ' + user.ip + ": " + data);
        const str = data.toString();
        let message;
        try {
            message = JSON.parse(str);
        } catch {
            failures++;
            if (failures > 10) {
                user.destroy();
                return;
            }
        }
        user.receive(message);
    });
    socket.once('close', () => {
        user.destroy();
    });
});
console.log('listening on 8060');