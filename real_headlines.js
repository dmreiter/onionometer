const fs = require('fs');
const request = require('request');
const Promise = require('bluebird');

const MAX_PAGES_OF_HEADLINES = 50;
const URL_BASE = (page) => `https://www.cbc.ca/aggregate_api/v1/items?pageSize=500&page=${page}`;

const run = async () => {
    const real_file = fs.createWriteStream('sentences/real.txt');
    real_file.write('title\n');

    for (let i = 1; i <= MAX_PAGES_OF_HEADLINES; i++) {
        console.log(`Getting page ${i} of real headlines...`);
        const { err, res, body } = await Promise.fromCallback((cb) => 
            request.get({ url: URL_BASE(i), json: true }, cb));

        if (err) throw new Error(err);

        Object.keys(body).map((key) => {
            // filter out non-news headlines
            const headline = body[key].title.toLowerCase();
            if (['story', 'stub', 'video'].includes(body[key].type) && headline.split(' ').length > 7) 
                // remove 'headlines' like "CBC Saskatchewan News March 23, 2018"
                if (headline.indexOf('cbc') === -1) 
                    real_file.write(`${headline}\n`);
        });
    }
    real_file.end();
}

module.exports = {
    run
};
