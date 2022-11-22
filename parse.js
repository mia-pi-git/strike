let buf = [];
process.stdin.on('data', d => {
    d = d.toString();
    if (!d.trim()) parse(buf.join('\n'));
    else buf.push(d);
});

const parse = (d) => {
    const lines = d.split('\n').map(f => f.trim()).filter(Boolean);
    const out = {};
    out.name = lines.shift() || "";
    lines.shift(); // rarity
    out.type = (lines.shift() || "").split(': ')[1].toLowerCase();
    out.victoryPoints = Number(process.argv[2]) || 0;
    out.stats = {};
    for (const p of ['health', 'move', 'range', 'attack']) {
        out.stats[p] = Number((lines.shift() || "").split(': ')[1]);
    }
    const sides = (lines.shift() || "").split(': ')[1]?.split(',').map(f => f.trim());
    const weak = [];
    const strong = [];
    for (const side of sides) {
        const str = side.split(' ')[1].trim();
        if (side.toLowerCase().startsWith('strong')) {
            if (str === 'sides') {
                strong.push('left', 'right');
            } else {
                strong.push(str);
            }
        }
        if (side.toLowerCase().startsWith('weak')) {
            if (str === 'sides') {
                weak.push('left', 'right');
            } else {
                weak.push(str);
            }
        }
    }
    if (weak.length) out.weakPoints = weak;
    if (strong.length) out.strengthPoints = strong;
    const ability = (lines.shift() || "").split(': ')[1]?.trim();
    if (ability && ability.toLowerCase() !== 'none') {
        out.skill = {};
        out.skill.name = ability;
        Object.assign(out.skill, {run() {}});
    }
    buf = [];
    console.log(out);
    console.log('\n');
}