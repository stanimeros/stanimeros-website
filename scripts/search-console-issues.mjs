// One-time setup: add the service account's client_email as a user in Search Console
// (Settings > Users and permissions > Add user, Restricted access is enough), then run:
//   node scripts/search-console-issues.mjs

import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SITE_URL = "sc-domain:stanimeros.com";
const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];
const KEY_PATH = path.resolve("scripts/gsc-service-account.json");

async function main() {
  if (!fs.existsSync(KEY_PATH)) {
    console.error(`Missing ${KEY_PATH}.`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({ keyFile: KEY_PATH, scopes: SCOPES });
  const searchconsole = google.searchconsole({ version: "v1", auth });

  console.log(`=== Sites visible to this service account ===`);
  const sites = await searchconsole.sites.list();
  for (const s of sites.data.siteEntry ?? []) {
    console.log(`- ${s.siteUrl} (${s.permissionLevel})`);
  }

  console.log(`\n=== Sitemaps for ${SITE_URL} ===`);
  const sitemaps = await searchconsole.sitemaps.list({ siteUrl: SITE_URL });
  for (const s of sitemaps.data.sitemap ?? []) {
    console.log(`- ${s.path} | last submitted: ${s.lastSubmitted} | errors: ${s.errors ?? 0} | warnings: ${s.warnings ?? 0}`);
  }

  console.log(`\n=== Top pages with low clicks / high impressions (last 28 days) ===`);
  const analytics = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: isoDaysAgo(28),
      endDate: isoDaysAgo(1),
      dimensions: ["page"],
      rowLimit: 25,
    },
  });
  for (const row of analytics.data.rows ?? []) {
    console.log(`${row.keys[0]} | clicks: ${row.clicks} | impressions: ${row.impressions} | ctr: ${(row.ctr * 100).toFixed(1)}% | pos: ${row.position.toFixed(1)}`);
  }
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

main().catch((err) => {
  console.error(err?.response?.data ?? err);
  process.exit(1);
});
