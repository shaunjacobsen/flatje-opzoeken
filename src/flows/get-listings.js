const { Browser } = require('./../Page.js');

async function getListings(page) {
  try {
    return await page.$$eval(
      'li.property-list-item-container',
      listingElems => {
        return listingElems.map(listing =>
          listing.getAttribute('data-property-id'),
        );
      },
    );
  } catch (e) {
    console.log('Could not fetch listing IDs for page:', e.message);
  }
}

async function getListingData(listingId, page) {
  return await page.$eval(
    `li.property-list-item-container[data-property-id=${listingId}]`,
    listing => {
      const images = Array.from(listing.querySelectorAll('img')).map(img => {
        return img.getAttribute('src') || img.getAttribute('data-src');
      });
      return {
        id: listing.getAttribute('data-property-id'),
        title: listing.querySelector('h2 a').innerText,
        surface: Number(
          listing
            .querySelector('li.surface')
            .innerText.replace(/[^0-9]+/gi, '')
            .trim(),
        ),
        bedrooms: Number(
          listing
            .querySelector('li.bedrooms')
            .innerText.replace(/[^0-9]+/gi, '')
            .trim(),
        ),
        furnished: listing.querySelector('li.furniture').innerText.trim(),
        postcode: listing
          .querySelector('.details .breadcrumbs li')
          .innerText.trim(),
        price: Number(
          listing
            .querySelector('p.price')
            .innerText.replace(/[^0-9]+/gi, '')
            .trim(),
        ),
        href: listing.querySelector('h2 a').getAttribute('href'),
        images,
      };
    },
  );
}

async function getDataForListings(listingIds, page) {
  let data = [];
  for (let i = 0; i < listingIds.length; i++) {
    data.push(await getListingData(listingIds[i], page));
  }
  return data;
}

async function getTotalResults() {
  const selector = '.search-results-wrapper .header p.count';
  await Browser.page.waitForSelector(selector);
  const content = await Browser.page.$eval(selector, elem => elem);
  return content.innerText;
}

module.exports = { getListings, getTotalResults, getDataForListings };
