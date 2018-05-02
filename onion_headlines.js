const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

const MAX_PAGES_OF_HEADLINES = 1000;

module.exports = {
    remove_duplicate_headlines(headlines) {
        const unique_headlines = [];
        headlines.forEach((headline) => {
            if (unique_headlines.indexOf(headline) === -1) unique_headlines.push(headline);
        });
        return unique_headlines;
    },
    
    async get_headlines(page, page_number, headlines) {
        if (arguments.length === 1) {
            page_number = 1;
            headlines = [];
        }
    
        if (page_number > MAX_PAGES_OF_HEADLINES) return headlines;
    
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        const new_headlines = $('.headline').map((i, e) => $(e).text().replace(/'"\(\)-/g, '')).toArray();
        console.log(`Found ${new_headlines.length} headlines on page ${page_number}.`);
    
        headlines = headlines.concat(new_headlines);
    
        await page.click('.load-more__button');
        await page.waitFor(3000);
    
        return this.get_headlines(page, page_number + 1, headlines);
    },
    
    write_headlines(headlines) {
        const initial_length = headlines.length;
        headlines = this.remove_duplicate_headlines(headlines);
        const final_length = headlines.length;
    
        console.log(`Removed ${initial_length - final_length} duplicate headlines`);
        console.log(`Writing ${final_length} headlines to file.`);
    
        const onion_file = fs.createWriteStream('sentences/onion.txt');
        onion_file.write('title\n');
        headlines.forEach((headline) => onion_file.write(`${headline}\n`));
        onion_file.end();
    },

    async run() {
        console.log('Getting onion headlines')
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
    
        await page.setViewport({ height: 960, width: 1270 });
        await page.goto('https://theonion.com');
    
        await page.waitFor(5000);
    
        const headlines = await this.get_headlines(page);
    
        this.write_headlines(headlines);
        await browser.close();
    }
}