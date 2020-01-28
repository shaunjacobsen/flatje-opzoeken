const { database } = require('./../firebase/index.js');

const apartmentsCollection = database.collection('apartments');
const metaCollection = database.collection('meta');

function saveListings(listings) {
  listings.forEach(listing => {
    try {
      apartmentsCollection.doc(listing.id).set(listing);
    } catch (e) {
      console.log('SAVE ERROR', e);
    }
  });
}

async function getRecentListingIds(limit = 500) {
  const snapshot = await apartmentsCollection
    .orderBy('date', 'asc')
    .limit(limit)
    .get();
  const docs = snapshot.docs;
  return docs.map(doc => doc.get('id'));
}

async function cleanupListings(before) {
  const data = await apartmentsCollection.where('date', '<', before).get();
  return data.docs.forEach(doc => doc.ref.delete());
}

async function saveMetadata({ timestamp, listings }) {
  return await metaCollection.doc(timestamp).set(listings);
}

module.exports = {
  saveListings,
  getRecentListingIds,
  cleanupListings,
  saveMetadata,
};
