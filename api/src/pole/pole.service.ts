import { Injectable } from '@nestjs/common';
import { Pole, User } from '@prisma/client';
import puppeteer, { Browser } from 'puppeteer';
import { DatabaseService } from 'src/db/db.service';

@Injectable()
export class PoleService {
    private browser: Promise<Browser> | undefined;
    private readonly poles: Pole[];

    constructor(private readonly dbService: DatabaseService) {
        this.browser = puppeteer.launch();

        this.poles = [];

        setImmediate(async () => {
            this.poles.push(...(await this.getExistingPoles()));

            this.poles.push(
                ...(await this.createNonExistingPoles([
                    'https://map.chargemap.com/pool/drawer/totalenergies-maurits-sabbelaan-antwerpen?locale=nl-nl',
                    'https://map.chargemap.com/pool/drawer/totalenergies-weerstandlaan-hoboken?locale=nl-nl',
                    'https://map.chargemap.com/pool/drawer/totalenergies-alfons-de-cockstraat-antwerpen?locale=nl-nl',
                    'https://map.chargemap.com/pool/drawer/totalenergies-sint-catharinaplein-antwerpen-kiel?locale=nl-nl',
                    'https://map.chargemap.com/pool/drawer/totalenergies-lodewijk-de-raetstraat-antwerpen?locale=nl-nl',
                ])),
            );

            await this.updatePoles();

            // TODO: Better update logic!
            // TODO: Split over different workers?
            setInterval(async () => {
                await this.updatePoles();
            }, 5 * 60 * 1000);
        });
    }

    public get allPoles() {
        return this.poles;
    }

    public async createNewPoles(urls: string[]): Promise<Pole[]> {
        const newPoles = await this.createNonExistingPoles(urls);
        this.poles.push(...newPoles);
        return newPoles;
    }

    public async getPolesForUser(user: User): Promise<Pole[]> {
        return await this.dbService.db.user
            .findUnique({
                where: {
                    id: user.id,
                },
            })
            .poles();
    }

    public async linkPoles(poleIds: number[], user: User): Promise<void> {
        await this.dbService.db.user.update({
            where: {
                id: user.id,
            },
            data: {
                poles: {
                    connect: poleIds.map((poleId) => ({ id: poleId + '' })),
                },
            },
        });
    }

    public async unlinkPoles(poleIds: number[], user: User): Promise<void> {
        await this.dbService.db.user.update({
            where: {
                id: user.id,
            },
            data: {
                poles: {
                    disconnect: poleIds.map((poleId) => ({ id: poleId + '' })),
                },
            },
        });
    }

    public async deletePoles(urls: string[]): Promise<void> {
        const result = await this.dbService.db.pole.deleteMany({ where: { id: { in: urls } } });

        if (result.count != urls.length) {
            console.error('Not all poles were deleted!');
            // TODO: What to do?
        }
    }

    private async getExistingPoles(): Promise<Pole[]> {
        return await this.dbService.db.pole.findMany();
    }

    public async getExistingPolesPaginated(lastCursor: string, direction: 'next' | 'prev'): Promise<Pole[]> {
        return await this.dbService.db.pole.findMany({
            take: direction === 'next' ? 25 : -25,
            cursor: {
              id: lastCursor,
            },
            orderBy: {
              id: 'asc',
            },
        });
    }

    private async createNonExistingPoles(urls: string[]): Promise<Pole[]> {
        const existingPoleUrls: string[] = this.poles.map((pole) => pole.id);
        const polesToCreate = urls.filter((url) => {
            return existingPoleUrls.indexOf(url) === -1;
        });

        const newlyCreatedPoles: Pole[] = [];

        for (const url of polesToCreate) {
            try {
                console.log('Creating pole...');
                newlyCreatedPoles.push(await this.createPole(url));
            } catch (error) {
                console.error('Could not create pole for: ' + url);
                console.error(error);
                continue;
            }
        }

        return newlyCreatedPoles;
    }

    private async createPole(url: string): Promise<Pole> {
        const page = await (await this.browser).newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const name: string =
            (
                await page.evaluate(() => {
                    return [...document.querySelectorAll('div.my-4')].map((el) => el.textContent);
                })
            ).at(0) ?? 'UNKNOWN';

        const address: string =
            (
                await page.evaluate(() => {
                    return [...document.querySelectorAll('[data-testid="pool-stations"] ~ p')].map(
                        (el) => el.textContent,
                    );
                })
            ).reduce((prev, cur) => prev + '/n' + cur) ?? 'UNKNOWN';

        const type: string =
            (
                await page.evaluate(() => {
                    return [...document.querySelectorAll('[data-testid="pool-stations"] img')].map((el) =>
                        (el as HTMLImageElement).src.indexOf('type2') ? 'TYPE 2' : 'UNKNOWN',
                    );
                })
            ).at(0) ?? 'UNKNOWN';

        const connectorCount: number =
            parseInt(
                (
                    await page.evaluate(() => {
                        return [...document.querySelectorAll('[data-testid="pool-stations"] p span')].map((el) =>
                            el.textContent.replace('/', ''),
                        );
                    })
                ).at(-1),
            ) ?? 0;

        const maxPower: number =
            parseInt(
                (
                    await page.evaluate(() => {
                        return [...document.querySelectorAll('[data-testid="pool-stations"] p')].map(
                            (el) => el.textContent,
                        );
                    })
                ).at(0),
            ) ?? 0;

        page.close();
        console.log('Pole scraped');

        const pole = await this.dbService.db.pole.create({
            data: { id: url, name, address, type, connectorCount, maxPower, inUse: 0 },
        });
        console.log('Pole saved');
        return pole;
    }

    private async updatePoles(): Promise<void> {
        for (const pole of this.poles) {
            try {
                console.log('Updating pole...');
                await this.updatePole(pole);
            } catch (error) {
                console.error('Could not update pole: ' + pole.name);
                console.error(error);
                this.resetScraper();
                continue;
            }
        }
    }

    private async updatePole(pole: Pole): Promise<void> {
        const page = await (await this.browser).newPage();
        await page.goto(pole.id, { waitUntil: 'networkidle2' });

        const free: number =
            parseInt(
                (
                    await page.evaluate(() => {
                        return [...document.querySelectorAll('[data-testid="pool-stations"] p span.font-semibold')].map(
                            (el) => el.textContent,
                        );
                    })
                ).at(0),
            ) ?? 0;
        pole.inUse = pole.connectorCount - free;
        page.close();

        console.log('Pole re-scraped');
        if (isNaN(free)) {
            console.warn('Could not update pole: ' + pole.name);
            return;
        }

        await this.dbService.db.pole.update({ where: { id: pole.id }, data: { ...pole } });

        console.log('Pole updated');
    }

    private async resetScraper(): Promise<void> {
        (await this.browser).close();
        this.browser = puppeteer.launch();
    }
}

export type PoleDto = {
    url: string;
};
