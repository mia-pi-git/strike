/**
 * Handles the app's 3 main panels.
 */


export const panels = new Map();

export function render() {
    for (const panel of panels.values()) {
        const out = panel.render();
        if (out) {
            panel.html(out);
        }
    }
}

function upper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export class Panel {
    el = null;
    constructor(app, elSelector) {
        this.app = app;
        this.el = $(elSelector);
        panels.set(elSelector, this);
    }
    html(arg) {
        return this.el.html(arg);
    }
    text(arg) {
        return this.el.text(arg);
    }
    render() {}
}

export class DataPanel extends Panel {
    curOpenPiece = null;
    constructor(app) {
        super(app, '#data');
    }
    render() {
        let buf = '<h2>All Pieces</h2><hr />';
        let lastVP = 0;
        for (const id in this.app.data.pieces) {
            const data = this.app.data.pieces[id];
            if (lastVP !== data.victoryPoints) {
                lastVP = data.victoryPoints;
                if (lastVP !== 1) buf += `<br />`;
                buf += `<strong>Victory Points: ${lastVP}</strong>`;
            }
            buf += `<div class="infobox piece" id="view-${id}" draggable="true">`;
            buf += `<span class="piece" id="${id}">${data.name}</span>`;
            buf += `</div>`;
        }
        buf += `<br />`;
        this.html(buf);
        $('span.piece').click(ev => {
            this.handlePieceClick(ev.currentTarget.id);
        });
        $('div.infobox.piece').on('dragstart', event => {
            console.log('start', event);
            const ev = event.originalEvent;
            this.app.curDrag = ev.target.id.replace('view-', '');
            ev.dataTransfer.effectAllowed = "move";
        });
        $('div.infobox.piece').on('dragend', () => {
            setTimeout(() => {
                this.app.curDrag = null;
            }, 100);
        });
    }
    handlePieceClick(id) {
        if (this.curOpenPiece === id) {
            this.curOpenPiece = null;
            return this.render();
        }
        this.curOpenPiece = id;
        console.log('clicked: ' + id);
        this.render(true);
        const el = this.el.find(`span#${id}`);
        if (el) {
            el.html(this.renderPieceDisplay(id));
        }
    }
    renderPieceDisplay(id) {
        const data = this.app.data.pieces[id];
        let buf = `<strong>${data.name}</strong> \u2193<hr />`;
        buf += `Type: ${upper(data.type)}<br />`;
        for (const k in data.stats) {
            let name = k;
            if (name === 'range') {
                name = 'Attack range';
            } else if (name === 'move') {
                name = 'Movement range';
            } else {
                name = upper(k);
            }
            buf += `${name}: ${data.stats[k]}<br />`;
        }
        if (data.strengthPoints) {
            buf += `Strong points: ${data.strengthPoints.map(upper).join(', ')}<br />`;
        }
        if (data.weakPoints) {
            buf += `Weak points: ${data.weakPoints.map(upper).join(', ')}<br />`;
        }
        if (data.skill) {
            buf += `Skill: ${data.skill.name}<br />`;
        }
        if (buf.endsWith('<br />')) {
            buf = buf.slice(0, -3);
        }
        return buf;
    }
}

export class TeamPanel extends Panel {
    pendingTeam = null;
    bank = 10;
    constructor(app) {
        super(app, '#team');
    }
    render() {
        let buf = `Drop team members here! (${this.bank} VP available)`;
        buf += `<span id="error" style="color: red">`;
        if (this.curError) {
            buf += `<br />${this.curError}`;
            this.curError = null;
        }
        buf += `</span>`;
        buf += `<div class="infobox" style="width: 360px" id="droploc">`;
        let bufferCount = 30;
        if (this.pendingTeam) {
            bufferCount -= this.pendingTeam.length;
            for (const [i, member] of this.pendingTeam.entries()) {
                buf += `<div class="infobox team" data-name="${member}" data-idx="${i}">`;
                buf += `<strong>${app.data.pieces[member].name}</strong></div>`;
            }
        }
        buf += '<br />'.repeat(bufferCount);
        buf += `</div>`;
        const attrs = [
            ['ondrop', 'app.teamDisplay.onDrop(event)'],
            ['ondragover', 'app.teamDisplay.onDrag(event)']
        ];
        this.el.html(buf);
        for (const [k, v] of attrs) {
            $('#droploc').attr(k, v);
        }
        $('div.infobox.team').click(ev => {
            if (ev.originalEvent.detail >= 2) {
                const el = $(ev.currentTarget);
                const id = el.attr('data-name');
                const idx = Number(el.attr('data-idx'));
                this.pendingTeam.splice(idx, 1);
                this.bank += this.app.data.pieces[id].victoryPoints;
                this.render();
            }
        });
    }
    onDrop() {
        const dragged = this.app.curDrag;
        if (!dragged) return;
        console.log(dragged);
        if (!this.pendingTeam) this.pendingTeam = [];
        let bank = 10;
        const seen = {};
        const out = [];
        for (const piece of this.pendingTeam.concat([dragged])) {
            const data = this.app.data.pieces[piece];
            if (!data) {
                this.error(`Invalid team member: '${piece}'.`);
                return false;
            }
            if (!seen[piece]) seen[piece] = 0;
            seen[piece]++;
            if (seen[piece] > 4) {
                this.error(`You can only have 4 of the ${data.name} piece.`);
                return false;
            }
            if (bank - data.victoryPoints < 0) {
                this.error(`You can only spend 10 VP for a set.`);
                return false;
            }
            bank -= data.victoryPoints;
            out.push(data.name);
        }
        this.bank = bank;
        this.pendingTeam.push(dragged);
        this.render();
    }
    error(message) {
        this.curError = message;
        this.render();
    }
    onDrag(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }
}

export class ControlPanel extends Panel {
    prevBuf = null;
    restoreTimeout = null;
    constructor(app) {
        super(app, '#controls');
    }
    error(message) {
        this.reset();
        this.prevBuf = this.el.html();
        this.el.html(
            `<span style="color: red">${message}</span><br />` + 
            `<button id="close-err">x</button>`
        );
        this.el.find('button#close-err').click(() => this.reset());
        this.restoreTimeout = setTimeout(() => this.reset(), 5000);
    }
    reset() {
        clearTimeout(this.restoreTimeout);
        this.restoreTimeout = null;
        if (this.prevBuf) {
            this.el.html(this.prevBuf);
            this.prevBuf = null;
        }
    }
}