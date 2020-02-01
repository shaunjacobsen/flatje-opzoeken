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
      return `<td><img width="105" src="${image}" alt="${idx}" /></td>`;
    });
  imageRefs = imageRefs.slice(0, 3);

  // prettier-ignore
  const html = `<!-- start of result -->
  <table role="presentation" border="0" cellpadding="5" cellspacing="0" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
    <tr>
      ${imageRefs.join('\n')}
    </tr>
    <tr>
      <td colspan="2" style="font-family:sans-serif;font-size:14px;vertical-align:top;">
        <h2 style="color:#ffffff;font-family:sans-serif;font-weight:400;line-height:1.4;margin:0;margin-bottom:16px;">${listing.title || '-'}</h2>
      </td>
      <td width="80" style="font-family:sans-serif;font-size:14px;vertical-align:top;">
        <h2 style="color:#ffffff;font-family:sans-serif;font-weight:400;line-height:1.4;margin:0;margin-bottom:16px;text-align: right; color:#FF4F00;margin-bottom: 6px;">${listing.price || '-'} €</h2>
        <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;margin-bottom: 6px;text-align: right;">
        <a href="https://www.google.com/maps?q=${listing.postcode || ''} Amsterdam" style="color: #999999; text-decoration: none;">${listing.postcode || '-'}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">
        <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;text-align: center;vertical-align: bottom;">${listing.surface || '-'} m<sup>2</sup></p>
      </td>
      <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">
        <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;text-align: center;vertical-align: bottom;">${listing.bedrooms || '-'} room(s)</p>
      </td>
      <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">
        <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px;text-align: center;vertical-align: bottom;">${listing.furnished || '-'}</p>
      </td>
    </tr>
  </table>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;box-sizing:border-box;width:100%;">
    <tbody>
      <tr>
        <td align="left" style="font-family:sans-serif;font-size:14px;vertical-align:top;padding-bottom:6px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;width:auto;">
            <tbody>
              <tr>
                <td style="font-family:sans-serif;font-size:14px;vertical-align:top;background-color:#ffffff;border-radius:5px;text-align:center;background-color:#FF4F00;">
                  <a href="https://pararius.nl/${listing.href || ''}" target="_blank" style="text-decoration:underline;background-color:#ffffff;border:solid 1px #FF4F00;border-radius:5px;box-sizing:border-box;color:#FF4F00;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;background-color:#FF4F00;border-color:#FF4F00;color:#000000;">Bekijken</a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <hr style="border:0;border-bottom:1px solid #f6f6f6;margin:20px 0;">
  <!-- end of result -->`

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
