import { Injectable } from '@nestjs/common';
import { Pole } from '@prisma/client';
import puppeteer, { Browser } from 'puppeteer';
import { DatabaseService } from 'src/db/db.service';

@Injectable()
export class PoleService {
    private browser: Promise<Browser>;

    private poles: Pole[];

    constructor(private dbService: DatabaseService) {
        this.browser = puppeteer.launch();

        this.poles = [];

        setImmediate(async () => {
             // TODO: Get from DB!
            await this.createPoles([
                'https://map.chargemap.com/pool/drawer/totalenergies-maurits-sabbelaan-antwerpen?locale=nl-nl',
                'https://map.chargemap.com/pool/drawer/totalenergies-weerstandlaan-hoboken?locale=nl-nl',
                'https://map.chargemap.com/pool/drawer/totalenergies-alfons-de-cockstraat-antwerpen?locale=nl-nl'
            ]);
            await this.updatePoles();

            setInterval(async () => {
                await this.updatePoles();
            }, 5 * 60 * 1000);
        });
    }

    private async createPoles(urls: string[]): Promise<void> {
        console.log('Creating poles...');

        const existingPoles: Pole[] = await this.dbService.db.pole.findMany({ where: { id: { in: urls }}});
        const existingPoleUrls: string[] = existingPoles.map((pole) => pole.id);
        this.poles.push(...existingPoles);

        const polesToCreate = urls.filter((url) => {
            return existingPoleUrls.indexOf(url) === -1;
        });

        for (const url of polesToCreate) {
            try {
                this.poles.push(await this.createPole(url));
            } catch (error) {
                console.error('Could not create pole for: ' + url);
                console.error(error);
                continue;
            }
        }
    }

    private async createPole(url: string): Promise<Pole> {
        const page = await (await this.browser).newPage(); 
        await page.goto(url, { waitUntil: 'networkidle2' });

        const name: string = (await page.evaluate(() => {
            return [...document.querySelectorAll('div.my-4')].map(el => el.textContent);
        })).at(0) ?? 'UNKNOWN';

        const address: string = (await page.evaluate(() => {
            return [...document.querySelectorAll('[data-testid="pool-stations"] ~ p')].map(el => el.textContent);
        })).reduce((prev, cur) => prev + '/n' + cur) ?? 'UNKNOWN';

        const type: string = (await page.evaluate(() => {
            return [...document.querySelectorAll('[data-testid="pool-stations"] img')].map(el => (el as HTMLImageElement).src.indexOf('type2') ? 'TYPE 2' : 'UNKNOWN');
        })).at(0) ?? 'UNKNOWN';

        const connectorCount: number = parseInt((await page.evaluate(() => { 
            return [...document.querySelectorAll('[data-testid="pool-stations"] p span')].map(el => el.textContent.replace('/', ''));
        })).at(-1)) ?? 0;

        const maxPower: number = parseInt((await page.evaluate(() => { 
            return [...document.querySelectorAll('[data-testid="pool-stations"] p')].map(el => el.textContent);
        })).at(0)) ?? 0;

        page.close();
        console.log('Pole scraped');

        const pole = await this.dbService.db.pole.create({ data: { id: url, name, address, type, connectorCount, maxPower, inUse: 0, url } });
        console.log('Pole saved');
        return pole;
    }

    private async updatePoles(): Promise<void> {
        console.log('Updating poles...');

        for (const pole of this.poles) {
            try {
                await this.updatePoleData(pole);
            } catch (error) {
                console.error('Could not update pole: ' + pole.name);
                console.error(error);
                continue;
            }
        }
    }

    private async updatePoleData(pole: Pole): Promise<void> {
        const page = await (await this.browser).newPage(); 
        await page.goto(pole.url, { waitUntil: 'networkidle2' });

        const free: number = parseInt((await page.evaluate(() => { 
            return [...document.querySelectorAll('[data-testid="pool-stations"] p span.font-semibold')].map(el => el.textContent);
        })).at(0)) ?? 0;
        pole.inUse = pole.connectorCount - free;
        page.close();
        
        console.log('Pole re-scraped');

        await this.dbService.db.pole.update({where: {id: pole.id}, data: {...pole}});

        console.log('Pole updated');
    }
}
