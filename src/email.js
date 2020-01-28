const fs = require('fs');
const { saveMetadata } = require('./firebase/actions.js');

function getEmailHTML() {
  fs.readFile('./public/email.html', (err, html) => {
    if (err) throw err;
    return html;
  });
}

function prepareHTML({ listings, metadata }) {
  if (!listings || listings.length < 1) throw Error('No listings.');
  let { timestamp } = metadata;
  let html = getEmailHTML();
  const listingsHTML = listings.map(renderListingHTML);
  html = html.replace(
    '%%_META_%%',
    `${listings.length} result(s) since ${new Date(timestamp).toLocaleString(
      'nl-NL',
    )}`,
  );
  html = html.replace('%%_RESULTS_%%', listingsHTML);

  return html;
}

function renderListingHTML(listing) {
  let imageRefs =
    listing.images &&
    listing.images.map((image, idx) => {
      return `<td width="30%"><img src="${image}" alt="${idx}" /></td>`;
    });
  imageRefs = imageRefs.slice(0, 2);

  // prettier-ignore
  const html = ```<!-- start of result -->
<table role="presentation" border="0" cellpadding="5" cellspacing="0">
  <tr>
    ${imageRefs.join('\n')}
    </td>
  </tr>

  <tr>
    <td colspan="2"><h2>${listing.title || '-'}</h2></td>
    <td width="80"><h2 style="text-align: right; color:#f9d423;margin-bottom: 6px;">${listing.price || '-'} €</h2>
      <p style="margin-bottom: 6px;text-align: right;">
        <a href="https://www.google.com/maps/place/${listing.postcode}+Amsterdam" style="color: #999; text-decoration: none;">1097 DL</a>
      </p>
    </td>
  </tr>

  <tr>
    <td><p style="text-align: center;vertical-align: bottom;">${listing.surface || '-'} m<sup>2</sup></p></td>
    <td><p style="text-align: center;vertical-align: bottom;">${listing.bedrooms || '-'} room(s)</p></td>
    <td><p style="text-align: center;vertical-align: bottom;">${listing.furnished || '-'}</p></td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
  <tbody>
    <tr>
      <td align="left">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td>
                <a href="https://pararius.nl/${listing.href || ''}" target="_blank">Bekijken</a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<hr />
<!-- end of result -->```;
}

async function sendEmail(data) {
  return new Promise((resolve, reject) => {
    try {
      const html = prepareHTML(data);
      console.log(html);
    } catch (e) {}
  });
}

module.exports = { sendEmail };
