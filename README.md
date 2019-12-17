# rsc-config
(de)serialize runescape classic config files. parse `config` archive files into
arrays of objects and re-encode + re-compress them back to the original format.

## install

    $ npm install @2003scape/rsc-config # -g for CLI program

## cli usage
```
rsc-config <command>

Commands:
  rsc-config dump-json <archive>            dump JSON files of each config
                                            section
  rsc-config pack-json <archive> <files..>  encode and compress JSON files into
                                            config archive

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## example
```javascript
const fs = require('fs');
const { Config } = require('./src');

const config = new Config();
config.loadArchive(fs.readFileSync('./config85.jag'));

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

fs.writeFileSync('./config86.jag', config.toArchive());
```

## api
### config.items
array of deserialized inventory items (swords, coins, food, etc.). these are
called "objects" in jagex documentation.

```javascript
[
    {
        name: 'item name',
        description: 'text displayed when examined',
        command: 'Bury', // item action: Bury, Eat, etc.
        sprite: 123, // item sprite index
        price: 12345, // base price for alchemy and shops
        stackable: false, // for multiple items in one slot (arrows, coins)
        special: false, // destroy on drop ? (only beads of death has this)
        equip: [
            '2-handed', // requires right-hand and left-hand
            'cape',
            'chest', // amulets
            'feet', // boots
            'hands', // gloves
            'legs', // skirts, platelegs, etc.
            'body', // leather body, chainmail
            'head', // medium helmet
            'right-hand', // weapons
            'left-hand', // shield
            'replace-legs', // replace character leg sprite (platelegs)
            'replace-body', // replace character body sprite (platemail)
            'replace-head' // replace character head sprite (large helmet)
        ] || null,
        colour: 'rgb(255, 0, 255)' || '#ff00ff' || null, // colourize grey
        untradeable: false,
        members: false
    }
]
```

### config.npcs
array of deserialized NPCs (non-player-characters; monsters).

```javascript
[
    {
        name: 'npc name',
        description: 'text displayed when examined',
        command: '', // pickpocket, ....
        attack: 12, // 1-99
        strength: 23,
        hits: 34,
        defense: 56,
        // https://classic.runescape.wiki/w/Aggressiveness
        // the client treats > 3 as 3
        hostility: null || 'retreats' || 'combative' || 'aggressive',
        // each animation maps to an index of config.animations
        animations: [
            null, // id of head animation
            null, // id of body animation
            null, // id of leg animation
            null, // id of hand animation
            null, // id of hand animation
            null, // id of overlay head animation
            null, // id of overlay body animation
            null, // id of overlay legs animation
            null, // id of gloves animation
            null, // id of feet animation
            null, // id of chest animation (necklaces)
            null // id cape animation
        ],
        hairColour: 'rgb(255, 0, 255)' || '#ff00ff' || null,
        topColour:  'rgb(255, 0, 255)' || '#ff00ff' || null,
        bottomColour: 'rgb(255, 0, 255)' || '#ff00ff' || null,
        skinColour: 'rgb(255, 0, 255)' || '#ff00ff' || null,
        width: 123,
        height: 456,
        walkModel: 6,
        combatModel: 6,
        combatAnimation: 5
    }
]
```

### config.textures
array of deserialized textures. these are used for walls, overlay tiles, roofs
and objects.

```javascript
[
    {
        name: 'wall', // main texture image name
        subName: 'door' // overlay texture image name
    }
]
```

### config.animations
array of deserialized animations. these are used for NPCs, players and wieldable
items.

```javascript
[
    {
        name: 'entity jag sprite collection', // sword, necklace, cape, etc.
        colour: 'rgb(255, 0, 255)' || '#ff00ff' || null, // colourize grey
        genderModel: 0,
        hasA: true,
        hasF: false
    }
]
```

### config.objects
array of deserialized game objects (tree, altar, furnace, etc.). these are
called "locations" in jagex documentation.

```javascript
[
    {
        name: 'object name',
        description: 'text displayed when examined',
        commands: [
            'WalkTo', // Mine, open, etc.
            'Examine' // Prospect
        ],
        // this is where the client learns which models to fetch from models
        // archive
        model: {
            name: 'model jag model name', // rocks1, shopsign, deadtree1, etc.
            id: 12 // index of the model in collection
        },
        width: 1, // extra tiles to occupy for collision detection
        height: 1,
        type: 'unblocked' || 'blocked' || 'closed-door' || 'open-door',
        itemHeight: 123 // height from ground of items on top of this object
    },
]
```

### config.wallObjects
array of deserialized wall objects (doors, walls) and are called "boundaries"
in jagex documentation. unlike game objects, they don't take up entire tiles if
they're blocking so they're useful for collision detection. their locations are
in the [landscape archives](https://github.com/2003scape/rsc-lanscape).

```javascript
[
    {
        name: 'wall name', // displayed when command[0] != WalkTo
        description: 'text displayed when examined', // commands[0] != WalkTo
        commands: [
            'WalkTo', // Open, Push, etc.
            'Examine' // Pick Lock, Close, etc.
        ],
        height: 192, // 275 for high walls
        colourFront: 'rgb(255, 0, 255)' || '#ff00ff' || null,
        textureFront: 2, // texture ID - requires null colourFront
        colourBack: 'rgb(255, 0, 255)' || '#ff00ff' || null,
        textureBack: 2, // texture ID - requires null colourBack
        blocked: true, // does wall block collisions?
        invisible: false
    }
]
```

### config.roofs
array of deserialized roofs. their locations are in the landscape archives.

```javascript
[
    {
        height: 64, // 64-90
        texture: 6 // corresponds to config.textures
    }
]
```

### config.tiles
array of deserialized tile overlays. their locations are in the landscape
archives.

```javascript
[
    {
        colour: 'rgb(255, 0, 255)' || null,
        texture: 12 || null, // corresponds to config.textures
        type: 'ground' || 'floor' || 'liquid' || 'bridge' || 'hole',
        blocked: false // does tile block collisions?
    }
]
```

### config.projectileSprite
decoded projectile sprite index.

### config.spells
array of deserialized magic spells.

```javascript
[
    {
        name: 'spell name', // displayed in client spell book
        description: 'spell description',
        level: 1, // 1-99
        // self are usually teleports, offensive are against NPCs and players,
        // inventory is used for alchemy and enchanment, object for obelisks
        type: 'self' || 'offensive' || 'inventory' || 'object',
        runes: [
            {
                id: 33, // corresponds to config.items
                amount: 1 // if elemental, staffs will give infinite amount
            }
        ]
    }
]
```

### config.prayers
array of deserialized prayers.

```javascript
[
    {
        name: 'prayer name', // displayed in client spell book (prayer tab)
        description: 'prayer description',
        level: 12,
        drain: 34
    }
]
```

### config = new Config()
create new config (de)serializer instance.

### config.loadArchive(buffer)
load a config jag archive buffer.

### config.toArchive()
return a config jag archive.

### SECTIONS
an array of config sections.

```javascript
[
    'items', 'npcs', 'textures', 'animations', 'objects', 'wallObjects',
    'roofs', 'tiles', 'spells', 'prayers', 'models'
]
```

## license
Copyright 2019  2003Scape Team

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see http://www.gnu.org/licenses/.
