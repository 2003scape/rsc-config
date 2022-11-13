#!/usr/bin/env node

import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import path from 'path';
import yargs from 'yargs';
import { Config, SECTIONS } from './index.js';
import { hideBin } from 'yargs/helpers';

const pkg = JSON.parse(await fs.readFile('./package.json'));

yargs(hideBin(process.argv))
    .scriptName('rsc-config')
    .version(pkg.version)
    .command(
        'dump-json <archive>',
        'dump JSON files of each config section',
        yargs => {
            yargs.positional('archive', {
                description: 'config jag archive',
                type: 'string'
            });

            yargs.option('pretty', {
                alias: 'p',
                description: 'pretty-print JSON files',
                type: 'boolean',
                default: false
            });

            yargs.option('output', {
                alias: 'o',
                description: 'directory to dump JSON files',
                type: 'string',
                default: './config-json'
            });
        },
        async argv => {
            const config = new Config();

            await config.init();

            try {
                config.loadArchive(await fs.readFile(argv.archive));

                await mkdirp(argv.output);

                for (const section of SECTIONS) {
                    const json =
                        JSON.stringify(
                            config[section],
                            null,
                            argv.pretty ? 4 : 0);

                    await fs.writeFile(
                        path.join(argv.output, `${section}.json`), json);

                    await fs.writeFile(
                        path.join(argv.output, 'projectileSprite.json'),
                        Buffer.from(config.projectileSprite.toString()));
                }
            } catch (e) {
                process.errorCode = 1;
                console.error(e);
            }
        })
    .command(
        'pack-json <archive> <files..>',
        'encode and compress JSON files into config archive',
        yargs => {
            yargs.positional('archive', {
                description: 'config jag archive',
                type: 'string'
            });

            yargs.positional('files', {
                description: 'JSON file of each config section',
                type: 'array'
            });
        },
        async argv => {
            if (argv.files.length !== SECTIONS.length + 1) {
                console.error('enter a file for each config section');
                return;
            }

            const config = new Config();

            await config.init();

            try {
                config.loadArchive(await fs.readFile(argv.archive));
            } catch (e) {
            }

            try {
                for (const filename of argv.files) {
                    const json =
                        JSON.parse((await fs.readFile(filename)).toString());
                    const section = path.basename(filename, '.json');
                    config[section] = json;
                }

                await fs.writeFile(argv.archive, config.toArchive());
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .demandCommand()
    .argv;
