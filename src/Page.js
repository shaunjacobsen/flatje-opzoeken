import puppeteer from 'puppeteer';
import config from './config.js';

class PuppeteerPage {
  /**
   * the Puppeteer instance of page (which most of methods are run at)
   * @type {puppeteer.PageType} page
   */
  page = null;
  /**
   * the Puppeteer instance of the browser
   * @type {puppeteer.BrowserType} browser
   */
  browser = null;
  /**
   * @type {puppeteer.CDPSession} client
   */
  client = null;

  async initialize() {
    const opts = {
      headless: config.headless,
      dumpio: config.dumpio,
      timeout: 1000,
      args: config.args,
      slowMo: 20,
    };

    console.log('CONFIG', config);
    console.log('OPTS', opts);

    const browser = await puppeteer.launch(opts);
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    page.setDefaultTimeout(5000);

    page.on('error', error => {
      console.log('PAGE ERROR', error);
      console.log('PAGE ERROR', error.message);
    });

    this.page = page;
    this.browser = browser;
    this.client = client;
  }
}

const Browser = new PuppeteerPage();
export default Browser;
