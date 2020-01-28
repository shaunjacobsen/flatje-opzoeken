const fs = require('fs');
const path = require('path');
const sg = require('@sendgrid/mail');

const { saveMetadata } = require('./firebase/actions.js');

sg.setApiKey(process.env.SENDGRID_API_KEY);

function getEmailHTML() {
  const file = path.resolve(__dirname, './public/email.html');
  return fs.readFileSync(file, 'utf8');
}

function prepareHTML({ listings, metadata }) {
  if (!listings || listings.length < 1) throw Error('No listings.');
  let { timestamp } = metadata;
  let html = getEmailHTML();
  const listingsHTML = listings.map(renderListingHTML);
  html = html.replace(
    '%%_META_%%',
    `${listings.length} result(s) at ${new Date(timestamp).toLocaleString(
      'nl-NL',
    )}`,
  );
  html = html.replace('%%_RESULTS_%%', listingsHTML);
  html = html.replace('<!-- end of result -->,<!-- start of result -->', '');

  return html;
}

function renderListingHTML(listing) {
  let imageRefs =
    listing.images &&
    listing.images.map((image, idx) => {
      return `<td width="30%"><img src="${image}" alt="${idx}" /></td>`;
    });
  imageRefs = imageRefs.slice(0, 3);

  // prettier-ignore
  const html = `<!-- start of result -->
    <table role="presentation" border="0" cellpadding="5" cellspacing="0" bgcolor="F7F9FC">
      <tr>
        ${imageRefs.join('\n')}
        </td>
      </tr>

      <tr>
        <td colspan="2"><h2>${listing.title || '-'}</h2></td>
        <td width="80"><h2 style="text-align: right; color:#FF4F00!important;margin-bottom: 6px;">${listing.price || '-'} €</h2>
          <p style="margin-bottom: 6px;text-align: right;">
            <a href="https://www.google.com/maps?q=${listing.postcode || ''} Amsterdam" style="color: #333; text-decoration: none;">${listing.postcode || '-'}</a>
          </p>
        </td>
      </tr>

      <tr>
        <td><p style="text-align: center;vertical-align: bottom;color:#333333;">${listing.surface || '-'} m<sup>2</sup></p></td>
        <td><p style="text-align: center;vertical-align: bottom;color:#333333;">${listing.bedrooms || '-'} room(s)</p></td>
        <td><p style="text-align: center;vertical-align: bottom;color:#333333;">${listing.furnished || '-'}</p></td>
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
    <!-- end of result -->`;

  return html;
}

async function sendEmail(data) {
  const { listings } = data;
  return new Promise(async (resolve, reject) => {
    try {
      const html = prepareHTML(data);
      // send via sendgrid
      const message = {
        to: process.env.TO_EMAIL,
        from: process.env.FROM_EMAIL,
        subject: `${listings.length} nieuwe flats gevonden!`,
        html,
      };

      const sent = await sg.send(message);
      resolve(html);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

module.exports = { sendEmail };
