const OnionHeadlines = require('./onion_headlines');
const RealHeadlines  = require('./real_headlines');
const options = require('optimist').argv;

async function run() {
    if (options.onion) await OnionHeadlines.run();
    if (options.real) RealHeadlines.run();
}

run();