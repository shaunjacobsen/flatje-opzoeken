import Browser from './../Page.js';

export async function getListings(page) {
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
        title: listing.querySelector('h2 a').innerText,
        surface: listing
          .querySelector('li.surface')
          .innerText.replace(/[^0-9]+/gi, ''),
        bedrooms: listing.querySelector('li.bedrooms').innerText,
        furnished: listing.querySelector('li.furniture').innerText,
        postcode: listing.querySelector('.details .breadcrumbs li').innerText,
        price: listing
          .querySelector('p.price')
          .innerText.replace(/[^0-9]+/gi, ''),
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
