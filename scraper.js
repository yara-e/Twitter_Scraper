const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function scrapeTwitterAccounts(twitterAccounts, stockSymbol, scrapeIntervalMinutes) {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // Replace with the actual path to your Chrome/Chromium executable
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    while (true) {
        let stockMentions = 0;

        for (const twitterAccount of twitterAccounts) {
            await page.goto(twitterAccount, { waitUntil: 'networkidle0', timeout: 60000 });

            let previousHeight = 0;
            let currentHeight = await page.evaluate('document.body.scrollHeight');
            while (previousHeight < currentHeight) {
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await new Promise(resolve => setTimeout(resolve, 6000));
                previousHeight = currentHeight;
                currentHeight = await page.evaluate('document.body.scrollHeight');
            }

            const tweets = await page.evaluate(() => {
                const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
                return Array.from(tweetElements).map(tweet => tweet.innerText);
            });

            const mentions = tweets.filter(tweet => tweet.includes(stockSymbol)).length;
            stockMentions += mentions;
        }

        console.log(`"${stockSymbol}" was mentioned ${stockMentions} times in the last ${scrapeIntervalMinutes} minutes.`);

        await new Promise(resolve => setTimeout(resolve, scrapeIntervalMinutes * 60000));
    }
}
const twitterAccounts = [
    'https://twitter.com/Mr_Derivatives',
    'https://twitter.com/warrior_0719',
    'https://twitter.com/ChartingProdigy',
    'https://twitter.com/allstarcharts',
    'https://twitter.com/yuriymatso',
    'https://twitter.com/TriggerTrades',
    'https://twitter.com/AdamMancini4',
    'https://twitter.com/CordovaTrades',
    'https://twitter.com/Barchart',
    'https://twitter.com/RoyLMattox'
];

const stockSymbol = '$SPX';
const scrapeIntervalMinutes = 15;
scrapeTwitterAccounts(twitterAccounts, stockSymbol, scrapeIntervalMinutes);