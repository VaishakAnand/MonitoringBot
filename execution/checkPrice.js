const puppeteer = require('puppeteer');

const checkPrice = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
        );

        await page.goto('https://wannaswap.finance/farm', {
            waitUntil: 'networkidle2',
        });

        try {
            await page.waitForSelector(
                '#headlessui-disclosure-button-11 > div > div.flex.flex-col.items-end.justify-center > div.font-bold.flex.justify.items-center.text-righttext-high-emphesis'
            );
        } catch (error) {
            await browser.close();
            console.error(error);
            return [0, null];
        }

        let val = await page.$$eval(
            '#headlessui-disclosure-button-11 > div > div.flex.flex-col.items-end.justify-center > div.font-bold.flex.justify.items-center.text-righttext-high-emphesis',
            (elem) => elem[0].textContent
        );

        let float = val.substring(0, val.length - 1);

        let price = await page.$$eval(
            'div.pl-3.text-primary.text-bold',
            (elem) => elem[0].textContent
        );

        console.log(float, price);
        await browser.close();
        return [parseFloat(float.replace(/,/g, '')), price];
    } catch (error) {
        await browser.close();
        throw error;
    }
};

module.exports = checkPrice;
