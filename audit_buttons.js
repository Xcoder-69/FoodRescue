const fs = require('fs');

const pages = fs.readdirSync('.').filter(f => f.endsWith('.html') && /^(1_splash|2_role|4_login|7_rest|10_ngo|9_vol|8_create|12_prof|13_impact|11_notif|restaurant_s|restaurant_t|ngo_browse|ngo_claim|delivery|restaurant_v|volunteer_nav|20_help|14_chat)/.test(f));

pages.sort().forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const alerts = (content.match(/alert\(/g) || []).length;
  const hrefHashSingle = (content.match(/href='#'/g) || []).length;
  const hrefHashDouble = (content.match(/href="#"/g) || []).length;
  const hrefHash = hrefHashSingle + hrefHashDouble;
  const comingSoon = (content.match(/coming soon/gi) || []).length;

  // Find all button texts to report
  const btnTexts = [];
  const btnMatches = content.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi);
  for (const m of btnMatches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim().substring(0, 40);
    if (text) btnTexts.push(text.replace(/\s+/g, ' '));
  }

  console.log('\n=== ' + page + ' ===');
  console.log('  alerts=' + alerts + ' | href=#=' + hrefHash + ' | coming_soon=' + comingSoon);
  console.log('  Buttons: ' + btnTexts.slice(0, 8).join(' | '));
});
