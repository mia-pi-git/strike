/**
 * All the things!
 */
import data from './data.json' assert {type: 'json'};
import * as panels from './panels.js';

export class App {
    data = data;
    dataDisplay = new panels.DataPanel(this);
    teamDisplay = new panels.TeamPanel(this);
    controlsDisplay = new panels.ControlPanel(this);
    socket = null;
    msgBuf = [];
    constructor() {
        panels.render();
        this.connect();
    }
    popup(msg) {
        alert(msg);
    }
    connect() {
        if (typeof WebSocket !== 'function') {
            return this.popup(
                "Your browser does not support WebSockets. " +
                "Please upgrade to play Strike."
            );
        }
        try {
            this.socket = new WebSocket(`wss://${location.hostname}/ws`);
        } catch {
            return this.popup("Connection failed. Try again later?");
        }

        this.socket.onerror = err => {
            this.popup("Connection errored: " + err.message);
        }

        this.socket.onopen = () => {
            this.reconnectAttempts = null;
            if (this.msgBuf?.length) {
                const buf = this.msgBuf.slice();
                this.msgBuf = null;
                for (const message of buf) {
                    this.send(message);
                }
            }
        }

        this.socket.onclose = this.maybeReconnect.bind(this);
        this.socket.onmessage = event => this.receive(event.data);

        this.chooseName();

        const params = new URLSearchParams(location.search.slice(1));
        const target = params.get('room');
        if (target) {
            return this.once('loggedin', () => {
                this.send({
                    type: 'joinGame',
                    target,
                });
            });
        }
        this.on('loggedin', ({message}) => {
            this.name = message;
            this.popup(`Your name was set to ${message}!`);
            $('#header').html(`<span style="text-align: left">Username: ${message}</span>`);
        });

        this.on('loginfailed', msg => {
            this.popup(`Login failed: ` + msg.message);
            setTimeout(() => {
                this.chooseName();
            }, 5000);
        });
    }
    chooseName() {
        let name = prompt("Please choose a name");
        if (!name) {
            return this.chooseName();
        }
        this.send({
            type: 'name',
            data: name,
        });
    }
    events = Object.create(null);
    once(type, cb) {
        if (!this.events[type]) this.events[type] = [];
        this.events[type].push({cb, isOnce: true});
    }
    on(type, cb) {
        if (!this.events[type]) this.events[type] = [];
        this.events[type].push({cb});
    }
    maybeReconnect() {
        if (!this.reconnectAttempts) this.reconnectAttempts = 0;
        if (this.reconnectAttempts >= 10) {
            return this.popup("You have been disconnected. Try again later?");
        }
        this.connect();
        this.reconnectAttempts++;
    }
    receive(dataStr) {
        console.log(dataStr);
        let message;
        try {
            message = JSON.parse(dataStr);
        } catch {
            return this.popup(
                `Malformed data received from server (${dataStr}). ` +
                `Please report this.`
            );
        }
        if (this.events[message.type]?.length) {
            for (const [i, {cb, isOnce}] of this.events[message.type].entries()) {
                cb(message);
                if (isOnce) {
                    this.events[message.type].splice(i, 1);
                }
            }
        }
        switch (message.type) {
        case 'error':
            return this.controlsDisplay.error(message.message);
        case 'gameStarted':
            /**
             * {"type":"gameStarted","message":"7b5ea85492c2bffe2e8b"}
             * {"room":"7b5ea85492c2bffe2e8b","type":"beginSelect"}
             */
            break;
        }
    }
    send(message) {
        if (this.msgBuf) {
            return this.msgBuf.push(message);
        }
        this.socket.send(JSON.stringify(message));
    }
}

export default App;