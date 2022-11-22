/**
 * Server-side pieces
 */

// https://www.pushsquare.com/guides/horizon-forbidden-west-machine-strike-all-pieces-and-how-to-play#pieces
// https://gamefaqs.gamespot.com/ps5/292822-horizon-forbidden-west/faqs/79837/stat-breakdown-and-machine-strike-piece-stats
export type Side = 'front' | 'back' | 'left' | 'right';
export interface PieceData {
    name: string;
    type: 'melee' | 'gunner' | 'ram' | 'dash' | 'swoop' | 'pull';
    victoryPoints: number;
    // unnecessary - same as victoryPoints
    // setupPoints: number;
    skill?: {
        name: string;
        run: (board: any) => void;
    };
    weakPoints?: Side[];
    strengthPoints?: Side[];
    stats: {
        attack: number,
        move: number,
        range: number,
        health: number,
    };
}

export const pieces: Record<string, PieceData> = {
    burrower: {
        name: "Burrower",
        type: "melee",
        victoryPoints: 1,
        stats: {
            attack: 2,
            health: 4,
            move: 2,
            range: 1,
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
    },
    spikesnout: {
        name: "Spikesnout",
        type: 'melee',
        victoryPoints: 1,
        stats: {
            attack: 1,
            range: 1,
            move: 4,
            health: 3
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
    },
    leaplasher: {
        name: "Leaplasher",
        type: 'melee',
        victoryPoints: 1,
        stats: {
            health: 3,
            move: 4, 
            range: 1,
            attack: 1,
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
        skill: {
            name: '+1 ATK power to all friendly machines in range',
            run() {},
        },
    },
    grazer: {
        name: "Grazer",
        type: 'ram',
        victoryPoints: 1,
        stats: {
            health: 4,
            move: 2,
            range: 1,
            attack: 1,
        },
        weakPoints: ['left', 'right'],
        strengthPoints: ['front'],
    },

    // vp 2
    trackerburrower: {
        name: "Tracker Burrower",
        type: 'melee',
        victoryPoints: 2,
        stats: {
            health: 4,
            move: 2,
            range: 1,
            attack: 2,
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
        skill: {
            name: "When you attack, your tile terrain lowers while your opponent's tile is raised",
            run() {},
        },
    },
    charger: {
        name: "Charger",
        type: "dash",
        victoryPoints: 2,
        stats: {
            health: 4,
            move: 2,
            range: 2,
            attack: 2,
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
        skill: {
            name: "+1 atk when attacking from Grassland tile",
            run() {},
        },
    },
    plowhorn: {
        name: "Plowhorn",
        type: 'ram',
        victoryPoints: 2,
        stats: {
            health: 5,
            move: 2,
            range: 1,
            attack: 2,
        },
        weakPoints: ['back'],
        strengthPoints: ['front'],
        skill: {
            name: "Attacking from a Grassland tile turns it into a Forest Tile",
            run() {},
        },
    },
    longleg: {
        name: 'Longleg',
        type: 'gunner',
        victoryPoints: 2,
        stats: { health: 6, move: 4, range: 2, attack: 1 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '+1 atk power to all friendly machines in range',
            run() {}
        }
    },
    bristleback: {
        name: 'Bristleback',
        type: 'ram',
        victoryPoints: 2,
        stats: { health: 4, move: 3, range: 1, attack: 2 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '-1 HP to all machines within atk range, friend and foe, during the start of every turn',
            run() {},
        },
    },
    fanghorn: {
        name: 'Fanghorn',
        type: 'ram',
        victoryPoints: 2,
        stats: { health: 5, move: 2, range: 2, attack: 2 },
        weakPoints: [ 'left', 'right' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '+1 atk when attacking from Mountain tile',
            run() {},
        },
    },
    lancehorn: {
        name: 'Lancehorn',
        type: 'ram',
        victoryPoints: 2,
        stats: { health: 5, move: 2, range: 2, attack: 2 },
        weakPoints: [ 'left', 'right' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '+1 atk when attacking from Hill tile',
            run() {},
        },
    },
    scrapper: {
        name: 'Scrapper',
        type: 'gunner',
        victoryPoints: 2,
        stats: { health: 4, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ]
    },
    skydrifter: {
        name: 'Skydrifter',
        type: 'swoop',
        victoryPoints: 2,
        stats: { health: 6, move: 2, range: 3, attack: 2 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ]
    },
    glinthawk: {
        name: 'Glinthawk',
        type: 'swoop',
        victoryPoints: 2,
        stats: { health: 5, move: 3, range: 3, attack: 2 },
        weakPoints: [ 'front' ],
        strengthPoints: [ 'back' ]
    },

    // vp 3
    redeyewatcher: {
        name: 'Red-Eye Watcher',
        type: 'gunner',
        victoryPoints: 3,
        stats: { health: 5, move: 2, range: 2, attack: 2 },
        weakPoints: [ 'front' ],
        strengthPoints: [ 'left', 'right' ],
        skill: {
            name: '-1 atk power for all enemies in range',
            run() {},
        },
    },
    shellwalker: {
        name: 'Shell-Walker',
        type: 'melee',
        victoryPoints: 3,
        stats: { health: 7, move: 2, range: 1, attack: 2 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '+1 atk when defending, regardless of tile',
            run() {},
        },
    },
    bellowback: {
        name: 'Bellowback',
        type: 'gunner',
        victoryPoints: 3,
        stats: { health: 7, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '-1 HP to all machines within atk range, friend and foe, during the start of every turn',
            run() {}
        },
    },
    widemaw: {
        name: 'Widemaw',
        type: 'pull',
        victoryPoints: 3,
        stats: { health: 7, move: 2, range: 3, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ]
    },
    snapmaw: {
        name: 'Snapmaw',
        type: 'pull',
        victoryPoints: 3,
        stats: { health: 7, move: 2, range: 3, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ]
    },
    clawstrider: {
        name: 'Clawstrider',
        type: 'melee',
        victoryPoints: 3,
        stats: { health: 8, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ]
    },
    sunwing: {
        name: 'Sunwing',
        type: 'swoop',
        victoryPoints: 3,
        stats: { health: 7, move: 2, range: 3, attack: 3 },
        weakPoints: [ 'front' ],
        strengthPoints: [ 'back' ],
    },

    // vp 4
    elementalclawstrider: {
        name: 'Elemental Clawstrider',
        type: 'melee',
        victoryPoints: 4,
        stats: { health: 8, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Attacking a machine on Forest tile will turn it into a Grassland tile',
            run() {}
        }
    },
    clamberjaw:   {
        name: 'Clamberjaw',
        type: 'melee',
        victoryPoints: 4,
        stats: { health: 8, move: 3, range: 1, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Attacking a machine on Forest tile will turn it into a Grassland tile',
            run() {},
        }
    },
    ravager: {
        name: 'Ravager',
        type: 'gunner',
        victoryPoints: 4,
        stats: { health: 9, move: 2, range: 2, attack: 2 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Atk hits both the targeted tile and all other perpendicular tiles',
            run() {},
        }
    },
    stalker: {
        name: 'Stalker',
        type: 'melee',
        victoryPoints: 4,
        stats: { health: 5, move: 3, range: 2, attack: 4 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '+1 atk when attacking from Forest tile',
            run() {},
        },
    },
    rollerback: {
        name: 'Rollerback',
        type: 'melee',
        victoryPoints: 4,
        stats: { health: 5, move: 3, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Rotates toward attacker and inflict -1 HP if within range when attacked',
            run() {},
        }
    },
    
    // vp 5
    behemoth: {
        name: 'Behemoth',
        type: 'gunner',
        victoryPoints: 5,
        stats: { health: 10, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'left', 'right' ],
        strengthPoints: [ 'front' ],
        skill: {
                name: '+1 atk when defending, regardless of tile',
                run() {},
        }
    },
    dreadwing: {
        name: 'Dreadwing',
        type: 'swoop',
        victoryPoints: 5,
        stats: { health: 9, move: 2, range: 3, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'At the start of each turn, each unit both friend and foe within range, rotates 180 degrees',
            run() {},
        },
    },
    tremortusk: {
        name: 'Tremortusk',
        type: 'dash',
        victoryPoints: 5,
        stats: { health: 10, move: 2, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Atk hits both the targeted tile and all other perpendicular tiles',
            run() {}
        }
    },

    // vp 6
    rockbreaker: {
        name: 'Rockbreaker',
        type: 'gunner',
        victoryPoints: 6,
        stats: { health: 9, move: 3, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'left', 'right' ],
        skill: {
            name: 'When you attack, your tile terrain lowers while your opponents raises',
            run() {},
        }
    },
    thunderjaw: {
        name: 'Thunderjaw',
        type: 'dash',
        victoryPoints: 6,
        stats: { health: 10, move: 3, range: 2, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Atk hits both the targeted tile and all other perpendicular tiles',
            run() {},
        },
    },
    shellsnapper: {
        name: 'Shellsnapper',
        type: 'pull',
        victoryPoints: 6,
        stats: { health: 10, move: 2, range: 3, attack: 3 },
        weakPoints: [ 'front' ],
        strengthPoints: [ 'left', 'right' ]
    },
    tideripper: {
        name: 'Tideripper',
        type: 'pull',
        victoryPoints: 6,
        stats: { health: 10, move: 2, range: 3, attack: 4 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'left', 'right' ]
    },
    stormbird: {
        name: 'Stormbird',
        type: 'swoop',
        victoryPoints: 6,
        stats: { health: 9, move: 3, range: 3, attack: 3 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Atk hits both the targeted tile and all other perpendicular tiles',
            run() {},
        }
    },

    // vp 7
    frostclaw: {
        name: 'Frostclaw',
        type: 'melee',
        victoryPoints: 7,
        stats: { health: 10, move: 2, range: 2, attack: 4 },
        weakPoints: [ 'left', 'right' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Attacking a machine on Marshland tile will turn it into a Grassland tile',
            run() {},
        }
    },
    fireclaw: {
        name: 'Fireclaw',
        type: 'melee',
        victoryPoints: 7,
        stats: { health: 10, move: 3, range: 2, attack: 4 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Attacking a machine on Forest tile will turn it into a Grassland tile',
            run() {}
        }
    },
    
    // vp 8
    scorcher: {
        name: 'Scorcher',
        type: 'dash',
        victoryPoints: 8,
        stats: { health: 12, move: 2, range: 2, attack: 4 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'Attacking a machine on Forest tile will turn it into a Grassland tile',
            run() {},
        }
    },

    // vp 9
    slitherfang: {
        name: 'Slitherfang',
        type: 'dash',
        victoryPoints: 9,
        stats: { health: 12, move: 2, range: 3, attack: 4 },
        weakPoints: [ 'back' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: 'When you attack, your tile terrain lowers while your opponents raises',
            run() {},
        }
    },
    
    // vp 10
    slaughterspine: {
        name: 'Slaughterspine',
        type: 'melee',
        victoryPoints: 10,
        stats: { health: 15, move: 2, range: 1, attack: 4 },
        weakPoints: [ 'left', 'right' ],
        strengthPoints: [ 'front' ],
        skill: {
            name: '-1 HP to all machines within atk range, friend and foe, during the start of every turn',
            run() {},
        }
    }
};


export const terrains: Record<string, {name: string, modifier: number}> = {
    marsh: {
        name: "Marsh",
        modifier: -1,
    },
    chasm: {
        name: "Chasm",
        modifier: -2,
    },
    grassland: {
        name: "Grassland",
        modifier: 0,
    },
    forest: {
        name: "Forest",
        modifier: 1,
    },
    hill: {
        name: "Hill",
        modifier: 2,
    },
    mountain: {
        name: "Mountain",
        modifier: 3,
    },
};