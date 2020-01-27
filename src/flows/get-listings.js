import Browser from './../Page.js';

export async function getListings() {
  try {
    return await Browser.page.$$eval(
      'li.property-list-item-container',
      listingElems => {
        return listingElems.map(listing =>
          listing.getAttribute('data-property-id'),
        );
      },
    );
  } catch (e) {
    console.log('Could not fetch listing IDs for page', e.message);
  }
}

async function getListingData(listingId) {
  return await Browser.page.$eval(
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

export async function getDataForListings(listingIds) {
  let data = [];
  for (let i = 0; i < listingIds.length; i++) {
    data.push(await getListingData(listingIds[i]));
  }
  return data;
}

export async function getTotalResults() {
  const selector = '.search-results-wrapper .header p.count';
  await Browser.page.waitForSelector(selector);
  const content = await Browser.page.$eval(selector, elem => elem);
  return content.innerText;
}
