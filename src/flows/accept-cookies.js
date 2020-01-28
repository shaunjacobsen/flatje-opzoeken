const Browser = require('./../Page.js');
const { click } = require('./../utils/index.js');

module.exports = {
  acceptCookies: async page => {
    const cookiePolicyClass = '.cookie-policy';
    // if .cookie-policy is on the page
    await page.waitFor(5000);
    const cookieWarning = await page.$(cookiePolicyClass);
    if (!cookieWarning) return null;
    // a.accept click
    await click('a.accept');
    return await !page.$(cookiePolicyClass);
  },
};
