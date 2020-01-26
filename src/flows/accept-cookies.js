import Browser from './../Page.js';
import { click } from './../utils/index.js';

export async function acceptCookies(page) {
  const cookiePolicyClass = '.cookie-policy';
  // if .cookie-policy is on the page
  await page.waitFor(5000);
  const cookieWarning = await page.$(cookiePolicyClass);
  if (!cookieWarning) return null;
  // a.accept click
  await click('a.accept');
  return await !page.$(cookiePolicyClass);
}
