import fs from 'fs/promises';
import { Config } from './src/index.js';

const config = new Config();
await config.init();
config.loadArchive(await fs.readFile('./config85.jag'));

config.items = config.items.map(item => {
    // Iron Mace -> ecaM norI
    item.name = item.name.split('').reverse().join('');
    return item;
});

config.npcs = config.npcs.map(npc => {
    npc.width = Math.floor(npc.width * 4/3);
    npc.height = Math.floor(npc.height * 4/3);
    return npc;
});

config.animations = config.animations.map(animation => {
    if (animation.colour) {
        animation.colour = '#ff00ff';
    }

    return animation;
});

await fs.writeFile('./config86.jag', config.toArchive());
