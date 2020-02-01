const puppeteer = require('puppeteer');
const _ = require('lodash');

const { Browser } = require('./Page.js');

const {
  getListings,
  getDataForListings,
  getTotalResults,
} = require('./flows/get-listings.js');
const {
  saveListings,
  getRecentListingIds,
  cleanupListings,
} = require('./firebase/actions.js');
const { sendEmail } = require('./email.js');

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

function log() {
  console.log(
    '==========================================================================',
  );
  console.log(...arguments);
  console.log(
    '==========================================================================',
  );
}

async function run() {
  try {
    const cleanupPeriod = Date.now() - 48 * 60 * 60 * 1000;
    log(
      'CLEANUP',
      'Getting rid of everything older than:',
      cleanupPeriod,
      '\nwhich is: ',
      new Date(cleanupPeriod),
    );
    cleanupListings(cleanupPeriod);

    await Browser.initialize();
    const page = Browser.page;
    await page.setViewport({ height: 800, width: 1024 });
    await page.goto(baseURL);

    let shouldContinue = true;

    let allNewListings = [];

    while (shouldContinue) {
      await page.waitForSelector('.search-results-list');
      const existingIds = await getRecentListingIds();

      const thisPageNewListings = await fetchPageListings(existingIds);
      if (thisPageNewListings && thisPageNewListings.length > 0) {
        allNewListings.push(thisPageNewListings);
      }

      await page.waitForSelector('ul.pagination');
      const nextButton = await page.$('ul.pagination li.next');
      if (!!nextButton) {
        await page.click('ul.pagination li.next');
      } else {
        break;
        shouldContinue = false;
      }
    }

    if (allNewListings.length < 1) {
      log('No new listings');
      process.exit(0);
    }

    allNewListings = _.flatten(allNewListings);
    await saveListings(allNewListings);

    // send the email
    await sendEmail({
      listings: allNewListings,
      metadata: { timestamp: Date.now() },
    });

    log('DONE\n', `Found ${allNewListings.length} listing(s).`);

    await Browser.browser.close();
    process.exit(0);
  } catch (error) {
    log('ERROR\n', error);
    process.exit(1);
  }
}

run();
