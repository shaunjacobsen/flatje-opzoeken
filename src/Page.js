const puppeteer = require('puppeteer');
const { config } = require('./config.js');

async function newBrowser() {
  const opts = {
    headless: config.headless,
    dumpio: config.dumpio,
    timeout: 0,
    args: config.args,
    slowMo: 20,
  };

  console.log('CONFIG', config);
  console.log('OPTS', opts);
  const browser = await puppeteer.launch(opts);
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  page.setDefaultTimeout(30000);

  page.on('error', error => {
    console.log('PAGE ERROR', error);
    console.log('PAGE ERROR', error.message);
  });

  return { page, Browser: browser, client };
}

async function initializeBrowser() {
  return await newBrowser();
}

module.exports = { initializeBrowser };
