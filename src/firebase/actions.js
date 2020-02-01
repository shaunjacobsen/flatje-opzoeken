const database = require('./../firebase/index.js');

const apartmentsCollection = database.collection('apartments');
const metaCollection = database.collection('meta');

async function saveListings(listings) {
  const batch = database.batch();
  listings.forEach(listing => {
    try {
      batch.set(apartmentsCollection.doc(listing.id), listing);
    } catch (e) {
      console.log('SAVE ERROR', e);
    }
  });

  return await batch.commit();
}

async function getRecentListingIds(limit = 500) {
  const snapshot = await apartmentsCollection
    .orderBy('date', 'asc')
    // .limit(limit)
    .get();
  const docs = snapshot.docs;
  return docs.map(doc => doc.get('id'));
}

async function cleanupListings(before) {
  const data = await apartmentsCollection.where('date', '<', before).get();
  console.log('found', data.docs.length, 'records to delete');
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
