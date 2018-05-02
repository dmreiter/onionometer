const fs = require('fs');
const request = require('request');
const Promise = require('bluebird');

const MAX_PAGES_OF_HEADLINES = 100;
const URL_BASE = (page) => `https://www.cbc.ca/aggregate_api/v1/items?pageSize=1000&page=${page}`;

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
                if (['story', 'stub', 'video'].includes(body[key].type) && body[key].title.indexOf('CBC') === -1)
                    real_file.write(`${body[key].title}\n`);
            });
        }
        real_file.end();
    }
};
