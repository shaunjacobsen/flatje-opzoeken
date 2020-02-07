const _ = require('lodash');

const { initializeBrowser } = require('./Page.js');

const { getListings, getDataForListings } = require('./flows/get-listings.js');
const {
  saveListings,
  getRecentListingIds,
  cleanupListings,
} = require('./firebase/actions.js');
const { sendEmail } = require('./email.js');

const baseURL =
  'https://www.pararius.com/apartments/amsterdam/0-1500/50m2/1-bedrooms/radius-5';

async function fetchPageListings(existingIds, page) {
  const listingIds = await getListings(page);
  const newListingIds = _.differenceBy(listingIds, existingIds);
  const listingData = await getDataForListings(newListingIds, page);
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

exports.run = url => {
  return new Promise(async (resolve, reject) => {
    try {
      const cleanupPeriod = Date.now() - 24 * 5 * 60 * 60 * 1000;
      log(
        'CLEANUP',
        'Getting rid of everything older than:',
        cleanupPeriod,
        '\nwhich is: ',
        new Date(cleanupPeriod),
      );
      cleanupListings(cleanupPeriod);

      const searchURL = url || baseURL;

      console.log('Search URL', searchURL);

      const { Browser, page } = await initializeBrowser();
      await page.setViewport({ height: 800, width: 1024 });
      await page.goto(searchURL);

      let shouldContinue = true;

      let allNewListings = [];

      while (shouldContinue) {
        await page.waitForSelector('.search-results-list');
        const existingIds = await getRecentListingIds();

        const thisPageNewListings = await fetchPageListings(existingIds, page);
        if (thisPageNewListings && thisPageNewListings.length > 0) {
          allNewListings.push(thisPageNewListings);
        }

        await page.waitForSelector('ul.pagination');
        const nextButton = await page.$('ul.pagination li.next');
        if (!!nextButton) {
          await page.click('ul.pagination li.next');
        } else {
          break;
        }
      }

      if (allNewListings.length < 1) {
        log('No new listings');
        return resolve();
      }

      allNewListings = _.flatten(allNewListings);
      await saveListings(allNewListings);

      // send the email
      await sendEmail({
        listings: allNewListings,
        metadata: { timestamp: Date.now() },
      });

      log('DONE\n', `Found ${allNewListings.length} listing(s).`);

      await Browser.close();
      return resolve();
    } catch (error) {
      log('ERROR\n', error);
      return reject();
    }
  });
};
