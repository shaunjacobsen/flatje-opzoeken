import Browser from './../Page.js';

export async function click(selector) {
  try {
    await Browser.page.waitForSelector(selector);
    await Browser.page.waitFor(200);
    await Browser.page.click(selector);
  } catch (e) {
    throw new Error(
      `Could not click on selector: ${selector}. Error: ${e.message}`,
    );
  }
}

export function stripToNumber(str) {
  return str.replace(/[^0-9]+/gi, '');
}
