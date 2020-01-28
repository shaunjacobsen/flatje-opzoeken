const env = process.env.NODE_ENV;

let pArgs = process.env.PUPPETEER_ARGS && process.env.PUPPETEER_ARGS.split(',');
let pExtraArgs =
  process.env.PUPPETEER_EXTRA_ARGS &&
  process.env.PUPPETEER_EXTRA_ARGS.split(',');

if (!pArgs || !pArgs.length) {
  pArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--js-flags=--expose-gc',
    '--shm-size=2gb',
  ];
}

if (!pExtraArgs || !pExtraArgs.length) {
  pExtraArgs = [];
}

const config = {
  baseUrl: process.env.PARARIUS_URL || 'https://www.pararius.com/',
  headless: !(!env || env === 'debug'),
  saveErrorScreenshots: env === 'debug' || process.env.SAVE_ERROR_SCREENSHOTS,
  visualRegressionThreshold: parseFloat(process.env.VR_THRESHOLD) || 0.5,
  dumpio: process.env.PUPPETEER_DUMPIO === 'true',
  args: [...pArgs, ...pExtraArgs],
  production: env === 'production',
};

module.exports = { config };
