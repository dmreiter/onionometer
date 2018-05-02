const OnionHeadlines = require('./onion_headlines');
const RealHeadlines  = require('./real_headlines');

async function run() {
    // await OnionHeadlines.run();
    await RealHeadlines.run();
}

run();