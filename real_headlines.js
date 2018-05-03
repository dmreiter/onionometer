const fs = require('fs');
const request = require('request');
const Promise = require('bluebird');

const MAX_PAGES_OF_HEADLINES = 21;
const URL_BASE = (page) => `https://www.cbc.ca/aggregate_api/v1/items?pageSize=1000&page=${page}`;

function num_words(str) {
    let words = 1;
    for (let i = 0; i < str.length; i++) if (str.charAt(i) === ' ') words++;
    return words;
}

module.exports = {
    async run() {
        const real_file = fs.createWriteStream('sentences/real.txt');
        real_file.write('title\n');

        for (let i = 1; i <= MAX_PAGES_OF_HEADLINES; i++) {
            console.log(`Getting page ${i} of real headlines...`);
            const { err, res, body } = await Promise.fromCallback((cb) => 
                request.get({ url: URL_BASE(i), json: true }, cb));

            if (err) throw new Error(err);

            Object.keys(body).map((key) => {
                // filter out non-news headlines
                if (['story', 'stub', 'video'].includes(body[key].type) && num_words(body[key].title) > 4) 
                    // remove 'headlines' like "CBC Saskatchewan News March 23, 2018"
                    if (body[key].title.indexOf('CBC') === -1) 
                        real_file.write(`${body[key].title}\n`);
            });
        }
        real_file.end();
    }
};
