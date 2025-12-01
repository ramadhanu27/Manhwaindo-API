const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

/**
 * Fetch HTML using Puppeteer (for JavaScript-heavy pages)
 * @param {string} url - Target URL
 * @returns {Promise<string>} HTML content
 */
async function fetchWithPuppeteer(url) {
  let browser = null;

  try {
    console.log(`[Puppeteer] Launching browser for: ${url}`);

    // Launch browser (works on Vercel)
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set realistic user agent
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Navigate to page
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForSelector(".posttl", { timeout: 10000 }).catch(() => {
      console.log("[Puppeteer] .posttl not found, continuing anyway");
    });

    // Get HTML
    const html = await page.content();

    console.log(`[Puppeteer] Success! HTML length: ${html.length}`);

    return html;
  } catch (error) {
    console.error(`[Puppeteer] Error: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { fetchWithPuppeteer };
