/// <reference lib="dom" />
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { writeFileSync } from "fs";
import { formatDate, isRaceActive } from "./lib/date";

chromium.use(StealthPlugin());

console.log("Begin scrpping");

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(
  "https://www.procyclingstats.com/races.php?popular=pro_me&s=upcoming-races&category=1",
  { waitUntil: "load" },
);

const races = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("table tr"))
    .slice(1, 10)
    .map((row) => {
      const cols = row.querySelectorAll("td");
      return {
        name: cols[1]?.textContent?.trim(),
        date: cols[0]?.textContent?.trim(),
        class: cols[2]?.textContent?.trim(),
        link: cols[1]?.querySelector("a")?.href,
      };
    });
});

const formattedRaces = races.map((race) => ({
  ...race,
  date: formatDate(race.date ?? ""),
}));

const activeRaces = formattedRaces.filter((race) => isRaceActive(race.date));

if (activeRaces.length > 0) {
  writeFileSync("data/races.json", JSON.stringify(activeRaces, null, 2));
}

await browser.close();

console.log(`End Scrapping - Found ${activeRaces.length} active races`);
