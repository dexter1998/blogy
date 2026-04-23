import {
  COINED_NAMES, PLAYFUL_NAMES, ABSTRACT_NAMES, FN, SN,
  TAGLINE_STYLES_3DPRINT, TAGLINE_STYLES_TECH, TAGLINE_STYLES_HEALTH,
  TAGLINE_STYLES_FINANCE, TAGLINE_STYLES_FOOD, TAGLINE_STYLES_FASHION,
  TAGLINE_STYLES_EDU, TAGLINE_STYLES_TRAVEL, TAGLINE_STYLES_HOME,
  TAGLINE_STYLES_BEAUTY, TAGLINE_STYLES_SPORT, TAGLINE_STYLES_CREATIVE,
  TAGLINE_STYLES_LOGISTICS, TAGLINE_STYLES_GREEN, TAGLINE_STYLES_DEFAULT,
  WHY_GENERATORS,
} from '../data/nameGeneratorData';

export function getNicheKey(cat) {
  const c = cat.toLowerCase();
  if (/3d print|print/.test(c) && /3d|print/.test(c)) return 'printing3d';
  if (/tech|ai|saas|software|app|cloud|data|digital|cyber|dev|code|api|iot|ml|blockchain|crypto|fintech|edtech|adtech|medtech|biotech|proptech|regtech|martech|deeptech|nanotech|quantum|neurotech|semiconductor|robotics|automation|devops|no.code|ar |vr |xr/.test(c)) return 'tech';
  if (/health|medical|clinic|care|wellness|therapy|mental|telehealth|pediatric|dermatology|orthopedic|dental|speech|nursing|yoga|pilates|fitness|gym|workout|meditation/.test(c)) return 'health';
  if (/finance|invest|wealth|trading|stock|forex|lending|loan|mortgage|credit|debt|insurance|cashback|budget|accounting|tax|bookkeeping|fintech|payment/.test(c)) return 'finance';
  if (/food|cook|recipe|baking|bbq|grill|coffee|beverage|juice|snack|restaurant|meal|nutrition|agri|farm/.test(c)) return 'food';
  if (/fashion|style|wear|apparel|clothing|activewear|jewelry|watch|handbag|accessories|shoe|eyewear|perfume|luxury brand/.test(c)) return 'fashion';
  if (/educat|learn|school|tutor|course|language|english|french|german|spanish|college|university|homeschool|chess/.test(c)) return 'edu';
  if (/travel|tour|adventure|backpack|cruise|nomad|trip|trek/.test(c)) return 'travel';
  if (/home|interior|decor|furniture|lighting|staging|renovation|improvement|boho|farmhouse|garden|bonsai|houseplant/.test(c)) return 'home';
  if (/beauty|makeup|nail|bridal|hair|salon|cosmetic|grooming|skincare|acne|anti.aging|glow/.test(c)) return 'beauty';
  if (/sport|cricket|basketball|football|tennis|golf|surfing|kayak|fishing|hiking|hunting|bodybuilding|crossfit/.test(c)) return 'sport';
  if (/photo|art|design|graphic|film|animation|creative|video|music|podcast|streaming|blogging/.test(c)) return 'creative';
  if (/logistics|delivery|cargo|shipping|trucking|fleet|supply chain|warehouse|last mile/.test(c)) return 'logistics';
  if (/clean|green|solar|renewable|wind energy|sustainability|climate|eco|zero waste|recycling/.test(c)) return 'green';
  return 'default';
}

function getTaglineStylesForNiche(key) {
  const map = {
    printing3d: TAGLINE_STYLES_3DPRINT,
    tech: TAGLINE_STYLES_TECH,
    health: TAGLINE_STYLES_HEALTH,
    finance: TAGLINE_STYLES_FINANCE,
    food: TAGLINE_STYLES_FOOD,
    fashion: TAGLINE_STYLES_FASHION,
    edu: TAGLINE_STYLES_EDU,
    travel: TAGLINE_STYLES_TRAVEL,
    home: TAGLINE_STYLES_HOME,
    beauty: TAGLINE_STYLES_BEAUTY,
    sport: TAGLINE_STYLES_SPORT,
    creative: TAGLINE_STYLES_CREATIVE,
    logistics: TAGLINE_STYLES_LOGISTICS,
    green: TAGLINE_STYLES_GREEN,
    default: TAGLINE_STYLES_DEFAULT,
  };
  return map[key] || TAGLINE_STYLES_DEFAULT;
}

function getS5Suffixes(cat) {
  const c = cat.toLowerCase();
  if (/fitness|gym|workout|crossfit|bodybuilding|strength|hiit|pilates/.test(c)) return ['Fitness','Strength','Training','Studio','Performance'];
  if (/yoga|meditation|mindful|asana/.test(c)) return ['Yoga','Wellness','Studio','Mindflow','Retreat'];
  if (/skincare|acne|anti.aging|derma|glow|clean beauty|natural skincare/.test(c)) return ['Skin','Derma','Glow','Aesthetics','Clinic'];
  if (/beauty|makeup|nail|bridal|hair|salon|cosmetic|grooming/.test(c)) return ['Beauty','Studio','Glam','Aesthetics','Artistry'];
  if (/food|cook|recipe|baking|bbq|grill|coffee|beverage|juice|snack|restaurant|meal|nutrition/.test(c)) return ['Kitchen','Eats','Table','Chef','Bakes'];
  if (/agritech|farm|crop|harvest|organic farm|smart farm|urban farm|herb|composting|aquaponics|hydroponics/.test(c)) return ['Farms','Agro','Harvest','Fields','Grows'];
  if (/cyber|security|threat|shield|protect/.test(c)) return ['Security','Shield','CyberLab','Protect','Defence'];
  if (/blockchain|crypto|defi|web3|nft|dao|token/.test(c)) return ['Chain','Web3','Crypto','Labs','Vault'];
  if (/\bai\b|machine learning|generative|neural|deeptech|nanotech|quantum|neurotech|semiconductor|robotics|ar startup|vr startup|metaverse|space tech/.test(c)) return ['AI','Labs','Systems','Ventures','Studio'];
  if (/saas|software|devops|api|no.code|cloud|app dev|mobile app|android|wordpress|shopify|erp|billing|invoice|payroll/.test(c)) return ['Tech','Software','Labs','Dev','Apps'];
  if (/fintech|finance|invest|wealth|trading|stock|forex|lending|loan|mortgage|credit|debt|insurance|cashback|budget/.test(c)) return ['Capital','Finance','Wealth','Invest','Advisors'];
  if (/accounting|tax|bookkeeping|cash flow/.test(c)) return ['Accounting','Tax','Advisory','Books','CPA'];
  if (/real estate|property|realty|home loan|proptech/.test(c)) return ['Properties','Realty','Homes','Estate','Ventures'];
  if (/edtech|educat|learn|school|tutor|course|language|college|university|homeschool/.test(c)) return ['Academy','Learning','Edu','Classes','Mentors'];
  if (/health|medical|clinic|care|wellness|therapy|mental|telehealth|telemedicine|pediatric|dental|speech|nursing|elder/.test(c)) return ['Health','Clinic','Care','Wellness','Heals'];
  if (/travel|tour|adventure|backpack|cruise|nomad|trip|trek/.test(c)) return ['Travels','Expeditions','Journeys','Escapes','Tours'];
  if (/fashion|style|wear|apparel|clothing|sustainable fashion|activewear/.test(c)) return ['Fashion','Styles','Couture','Wear','Label'];
  if (/jewelry|watch|handbag|accessories|shoe|eyewear|perfume|luxury/.test(c)) return ['Collection','Atelier','Luxe','Gallery','Studio'];
  if (/marketing|advertising|branding|seo|social media|content|copywriting|influencer|email marketing|growth/.test(c)) return ['Media','Creative','Agency','Brands','Studio'];
  if (/hr|human resources|staffing|recruit|talent|employee/.test(c)) return ['HR','People','Talent','Workforce','Associates'];
  if (/legal|law|compliance|regtech|contract|immigration/.test(c)) return ['Legal','Law','Advocates','Counsel','Associates'];
  if (/pet|dog|cat|animal|vet|bird/.test(c)) return ['Paws','Petcare','Vets','Animals','Tails'];
  if (/gaming|esport|game dev|console|board game|indie game|mobile gaming/.test(c)) return ['Gaming','Arena','Plays','Guild','Games'];
  if (/music|jazz|guitar|hip.hop|indie music|music production|podcast/.test(c)) return ['Music','Sounds','Beats','Records','Studio'];
  if (/photo|art|design|graphic|film|animation|creative|video/.test(c)) return ['Studios','Creative','Visuals','Arts','Works'];
  if (/logistics|delivery|cargo|shipping|trucking|fleet|supply chain|warehouse|last mile/.test(c)) return ['Logistics','Cargo','Freight','Hauls','Express'];
  if (/clean|green|solar|renewable|wind energy|sustainability|climate|eco|zero waste|recycling/.test(c)) return ['Energy','Green','Eco','Ventures','Sustainability'];
  if (/home|interior|decor|furniture|lighting|staging|renovation|improvement|boho|farmhouse/.test(c)) return ['Home','Interiors','Decor','Living','Studio'];
  if (/wedding|bridal/.test(c)) return ['Weddings','Bridal','Events','Celebrations','Studio'];
  if (/event|hospitality|hotel|coworking/.test(c)) return ['Events','Hospitality','Venues','Spaces','Co'];
  if (/sport|cricket|basketball|football|tennis|golf|surfing|kayak|fishing|hiking|hunting/.test(c)) return ['Sports','Athletics','Arena','Field','Pro'];
  if (/kids|baby|toy|child|parenting|family/.test(c)) return ['Kids','Family','Juniors','Tots','Co'];
  if (/senior|elder|nursing|hearing/.test(c)) return ['Care','Seniors','Wellness','Comfort','Living'];
  if (/startup|venture|entrepreneur|funding/.test(c)) return ['Ventures','Startup','Capital','Studio','Labs'];
  if (/project management|productivity|crm|workflow|team|remote work/.test(c)) return ['Works','Productivity','Flow','Teams','Collab'];
  if (/repair|service|maintenance|cleaning|plumbing|hvac|roofing|pest/.test(c)) return ['Services','Repairs','Works','Fix','Pro'];
  if (/blogging|publish|writing|book|reading/.test(c)) return ['Books','Reads','Writes','Pages','Stories'];
  if (/drone|robot|iot|wearable|smart home|smart city|smart lock|smart watch/.test(c)) return ['Tech','Labs','Devices','Smart','Systems'];
  if (/automotive|car |auto |bike |vehicle|motorcycle|fleet|tire/.test(c)) return ['Motors','Auto','Drives','Wheels','Works'];
  const fw = cat.split(' ')[0];
  return [fw + ' Co', fw + ' Studio', fw + ' Works', fw + ' Hub', fw + ' Ventures'];
}

function buildPool(cat, catIdx, styleNum) {
  const key = getNicheKey(cat);
  if (styleNum === 1) {
    const pool = COINED_NAMES[key] || COINED_NAMES.default;
    const offset = (catIdx * 7) % pool.length;
    return Array.from({ length: pool.length }, (_, i) => pool[(offset + i) % pool.length]);
  }
  if (styleNum === 2) {
    const pool = PLAYFUL_NAMES[key] || PLAYFUL_NAMES.default;
    const offset = (catIdx * 5) % pool.length;
    return Array.from({ length: pool.length }, (_, i) => pool[(offset + i) % pool.length]);
  }
  if (styleNum === 3) {
    const pool = ABSTRACT_NAMES[key] || ABSTRACT_NAMES.default;
    const offset = (catIdx * 11) % pool.length;
    return Array.from({ length: pool.length }, (_, i) => pool[(offset + i) % pool.length]);
  }
  if (styleNum === 4) {
    const sfx = ['India','India Online','Online India','Platform India','Service India','App India','Tool India','Solutions India','Agency India','for Business India','for Beginners India','Near Me India','Subscription India','2025 India','Community India','Course India','Consulting India','Analytics India','Reviews India','Marketplace India'];
    const pfx = ['Best','Top','Affordable','Professional','Online','Leading','Trusted','Expert','Certified','Premium'];
    const names = new Set();
    sfx.forEach(s => names.add(cat + ' ' + s));
    pfx.forEach(p => names.add(p + ' ' + cat));
    return [...names];
  }
  // styleNum === 5: Founder names
  const suffixes = getS5Suffixes(cat);
  const pool = [];
  const used = new Set();
  let i = 0;
  while (pool.length < 40 && i < 600) {
    const fn = FN[(i * 7 + catIdx * 3) % FN.length];
    const sn = SN[(i * 11 + catIdx * 5) % SN.length];
    const suf = suffixes[pool.length % suffixes.length];
    const pat = i % 4;
    let name;
    if (pat === 0)      name = fn + ' ' + suf;
    else if (pat === 1) name = sn + ' ' + suf;
    else if (pat === 2) name = fn + ' ' + sn + ' ' + suf;
    else                name = sn + ' & ' + fn + ' ' + suf;
    if (!used.has(name)) { used.add(name); pool.push(name); }
    i++;
  }
  return pool;
}

export function generate5Names(cat, catIdx, styleNum, seed) {
  const key = getNicheKey(cat);
  const styles = getTaglineStylesForNiche(key);
  const whyGens = WHY_GENERATORS[key] || WHY_GENERATORS.default;
  const pool = buildPool(cat, catIdx, styleNum);

  const results = [];
  for (let i = 0; i < 5; i++) {
    const nameIdx = (seed * 5 + i) % pool.length;
    const name = pool[nameIdx];
    const taglineIdx = (seed * 5 + i) % styles.length;
    const whyIdx = (seed * 5 + i) % whyGens.length;
    results.push({
      name,
      tagline: styles[taglineIdx](name),
      why: whyGens[whyIdx](name),
    });
  }
  return results;
}
