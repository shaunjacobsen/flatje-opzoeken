import puppeteer from 'puppeteer';

import Browser from './Page.js';

import { acceptCookies } from './flows/accept-cookies.js';
import { getListings, getDataForListings } from './flows/get-listings.js';

const baseURL =
  'https://www.pararius.com/apartments/amsterdam/0-1500/50m2/1-bedrooms';

(async () => {
  try {
    await Browser.initialize();
    const page = Browser.page;
    await page.setViewport({ height: 800, width: 1024 });
    await page.goto(baseURL);
    await page.screenshot({ path: 'example.png' });

    // accept cookies if the box is there
    // await acceptCookies(page);
    // get all ids of the listings
    const listingIds = await getListings(page);
    const listingData = await getDataForListings(listingIds);
    // compare with ids that have already been grabbed
    // discard those that are already indexed
    // continue to next page
    // repeat

    // await Browser.page.close();
    await Browser.browser.close();
  } catch (error) {
    console.log('ERROR', error);
  }
})();
