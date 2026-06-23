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
  { waitUntil: "domcontentloaded", timeout: 60000 },
);

// Wait for table to be present with longer timeout
await page.waitForSelector("table tr", { timeout: 15000 });
// Give the page a moment to fully render
await page.waitForTimeout(1000);

try {
  const races = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tr")).slice(1, 10);
    console.log(`Found ${rows.length} rows`);

    return rows.map((row) => {
      const cols = row.querySelectorAll("td");
      return {
        name: cols[1]?.textContent?.trim(),
        date: cols[0]?.textContent?.trim(),
        class: cols[2]?.textContent?.trim(),
        link: cols[1]?.querySelector("a")?.href,
      };
    });
  });
  console.log("Races evaluated successfully:", races);
  const formattedRaces = races.map((race) => ({
    ...race,
    date: formatDate(race.date ?? ""),
  }));
  const activeRaces = formattedRaces.filter((race) => isRaceActive(race.date));
  console.log({ activeRaces });
  console.log(`Found ${activeRaces.length} active races:`, activeRaces);

  // Always write the file, even if empty
  writeFileSync("data/races.json", JSON.stringify(activeRaces, null, 2));
  console.log("File written successfully to data/races.json");
} catch (error) {
  console.error("Error evaluating races:", error);
  const races = [];
}

await browser.close();
