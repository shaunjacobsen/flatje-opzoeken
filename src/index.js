import puppeteer from 'puppeteer';
import _ from 'lodash';

import Browser from './Page.js';

import { acceptCookies } from './flows/accept-cookies.js';
import {
  getListings,
  getDataForListings,
  getTotalResults,
} from './flows/get-listings.js';
import {
  saveListings,
  getRecentListingIds,
  cleanupListings,
} from './firebase/actions.js';

const baseURL =
  'https://www.pararius.com/apartments/amsterdam/0-1500/50m2/1-bedrooms/radius-5';

async function fetchPageListings(existingIds) {
  const listingIds = await getListings();
  console.log('existingIds', existingIds);
  const newListingIds = _.differenceBy(listingIds, existingIds);
  console.log('new listing ids', newListingIds);
  const listingData = await getDataForListings(newListingIds);
  return listingData.map(listing => {
    return { ...listing, date: Date.now(), dispatched: false };
  });
}

function getNextUrl(currentUrl, nextPage) {
  const noTrailingSlash = /https:\/\/.*[^\/]$/;
  const patternHasPageNumber = /https:\/\/.*\/page-([0-9])$/;
  let nextUrl = currentUrl;
  if (currentUrl.match(patternHasPageNumber)) {
    nextUrl = nextUrl.replace(/\/page-[0-9]+/, `/page-${nextPage}`);
  } else if (
    currentUrl.match(noTrailingSlash) &&
    !currentUrl.match(patternHasPageNumber)
  ) {
    // add /page-2
    nextUrl += `/page-${nextPage}`;
  } else {
    // add page-2
    nextUrl += `page-${nextPage}`;
  }

  return nextUrl;
}

(async () => {
  try {
    // delete entries from db that are 48 hours or older
    const cleanupPeriod = Date.now() - 48 * 60 * 60 * 1000;
    console.log(
      '==========================================================================',
    );
    console.log('CLEANUP');
    console.log(
      'Getting rid of everything older than:',
      cleanupPeriod,
      '\nwhich is: ',
      new Date(cleanupPeriod),
    );
    console.log(
      '==========================================================================',
    );
    cleanupListings(cleanupPeriod);

    await Browser.initialize();
    const page = Browser.page;
    await page.setViewport({ height: 800, width: 1024 });
    await page.goto(baseURL);

    let shouldContinue = true;

    let currentPage = 1;
    let prevPageListingCount;
    let allNewListings = [];

    while (shouldContinue) {
      const existingIds = await getRecentListingIds();

      const thisPageNewListings = await fetchPageListings(existingIds);
      if (thisPageNewListings && thisPageNewListings.length > 0) {
        saveListings(thisPageNewListings);
        allNewListings.push(thisPageNewListings);
      }

      if (!prevPageListingCount)
        prevPageListingCount = thisPageNewListings.length;

      if (prevPageListingCount > 0 && currentPage <= 10) {
        const nextPage = currentPage + 1;
        const nextUrl = getNextUrl(page.url(), nextPage);
        console.log('going to page', nextUrl);
        console.log('prevPageListingCount', prevPageListingCount);
        currentPage = nextPage;
        prevPageListingCount = thisPageNewListings.length;
        await page.goto(nextUrl);
      } else {
        currentPage += 1;
        console.log('should stop');
        shouldContinue = false;
      }
    }

    allNewListings = _.flatten(allNewListings);

    console.log(
      '==========================================================================',
    );
    console.log('DONE');
    console.log(
      `Found ${allNewListings.length} listing(s). Will now email...`,
      allNewListings,
    );
    console.log(
      '==========================================================================',
    );

    await Browser.browser.close();
    process.exit(0);
  } catch (error) {
    console.log('ERROR', error);
    process.exit(1);
  }
})();
