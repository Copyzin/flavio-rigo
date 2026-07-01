const fs = require("fs");

const API_KEY = "AIzaSyB29x5UH7Z935pwjJQ_Am-V7nyF4xUVB24";
const SITE = "https://flaviorigoadvogado.com.br/";

async function getPageSpeed(strategy) {
  const url =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(SITE)}` +
    `&strategy=${strategy}` +
    `&key=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  const lhr = data.lighthouseResult || {};
  const perfCategory = (lhr.categories || {}).performance || {};
  const auditRefs = (perfCategory.auditRefs || []).map((r) => r.id);
  const perfAudits = {};
  for (const id of auditRefs) {
    if (lhr.audits && lhr.audits[id]) perfAudits[id] = lhr.audits[id];
  }

  const result = {
    loadingExperience: data.loadingExperience,
    categories: { performance: perfCategory },
    audits: perfAudits,
  };

  fs.writeFileSync(
    `.diagnostics/pagespeed-${strategy}.json`,
    JSON.stringify(result, null, 2)
  );

  console.log(`pagespeed-${strategy}.json gerado`);
}

(async () => {
  await getPageSpeed("mobile");
  await getPageSpeed("desktop");
})();