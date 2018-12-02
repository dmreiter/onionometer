const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');

const MAX_PAGES_OF_HEADLINES = 1000;

const get_headlines = async (page, page_number, headlines) => {
    if (!page_number || !headlines) {
        page_number = 1;
        headlines = [];
    }

    if (page_number > MAX_PAGES_OF_HEADLINES) return headlines;

    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);
    const new_headlines = $('.headline').map((i, e) => {
        const text = $(e).text().replace(/'"\(\)-/g, '').toLowerCase();
        if (text.split(' ').length < 6)
            return null;
        return text;
    }).toArray();
    const compacted_headlines = _.compact(new_headlines);
    console.log(`Found ${compacted_headlines.length} headlines on page ${page_number}.`);

    headlines = headlines.concat(compacted_headlines);

    await page.click('.load-more__button');
    await page.waitFor(3000);

    return get_headlines(page, page_number + 1, headlines);
};

const write_headlines = (headlines) => {
    const initial_length = headlines.length;
    headlines = _.uniq(headlines);
    const final_length = headlines.length;

    console.log(`Removed ${initial_length - final_length} duplicate headlines`);
    console.log(`Writing ${final_length} headlines to file.`);

    const onion_file = fs.createWriteStream('sentences/onion.txt');
    onion_file.write('title\n');
    headlines.forEach((headline) => onion_file.write(`${headline}\n`));
    onion_file.end();
};

const run = async () => {
    console.log('Getting onion headlines')
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ height: 960, width: 1270 });
    await page.goto('https://theonion.com');

    await page.waitFor(5000);

    const headlines = await get_headlines(page);

    write_headlines(headlines);
    await browser.close();
}

module.exports = {
    run
}