import { database } from './../firebase/index.js';

const apartmentsCollection = database.collection('apartments');

export function saveListings(listings) {
  listings.forEach(listing => {
    try {
      apartmentsCollection.doc(listing.id).set(listing);
    } catch (e) {
      console.log('SAVE ERROR', e);
    }
  });
}

export async function getRecentListingIds(limit = 500) {
  const snapshot = await apartmentsCollection
    .orderBy('date', 'asc')
    .limit(limit)
    .get();
  const docs = snapshot.docs;
  return docs.map(doc => doc.get('id'));
}

export async function cleanupListings(before) {
  const data = await apartmentsCollection.where('date', '<', before).get();
  return data.docs.forEach(doc => doc.ref.delete());
}
