// Usage: node scripts/generate-startup-names.js <path-to-csv>
// Example: node scripts/generate-startup-names.js data/startup_names.csv

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const STYLE_ORDER = ['Professional', 'Playful', 'Clever', 'Descriptive', 'Personal'];
const STYLE_META = {
  Professional: { label: 'Professional & Authoritative', desc: 'Names that establish credibility and position your startup as a trusted industry leader.' },
  Playful:      { label: 'Playful & Fun',                desc: 'Approachable names that make your brand feel friendly and accessible to a wide audience.' },
  Clever:       { label: 'Clever & Creative',            desc: 'Smart wordplay and industry-specific references that insiders will immediately appreciate.' },
  Descriptive:  { label: 'Clear & Descriptive',          desc: 'Names that tell exactly what you do — perfect for SEO and instant clarity.' },
  Personal:     { label: 'Personal Brand Style',         desc: 'Names that feel like they come from an individual, building a direct connection with your audience.' },
};

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('❌  Usage: node scripts/generate-startup-names.js <path-to-csv>');
  process.exit(1);
}

const resolved = path.resolve(process.cwd(), csvPath);
if (!fs.existsSync(resolved)) {
  console.error(`❌  File not found: ${resolved}`);
  process.exit(1);
}

const csv = fs.readFileSync(resolved, 'utf8');
const { data, errors } = Papa.parse(csv, { header: true, skipEmptyLines: true });

if (errors.length) {
  const msgs = errors.map(e => e.message).join(', ');
  console.warn('⚠️  CSV parse warnings:', msgs);
}

// Build category map — first row per slug wins for category-level fields
const categoryMap = {};
for (const row of data) {
  const { category, slug, page_title, category_description, long_description,
          emoji, works_for, featured, name_category, name, tagline, why } = row;
  if (!slug || !name) continue;

  if (!categoryMap[slug]) {
    categoryMap[slug] = {
      category:             (category || slug).trim(),
      slug:                 slug.trim(),
      page_title:           (page_title || `${category} Startup Names`).trim(),
      category_description: (category_description || '').trim(),
      long_description:     (long_description || '').trim(),
      emoji:                (emoji || '').trim(),
      works_for:            (works_for || '').split('|').map(s => s.trim()).filter(Boolean),
      featured:             (featured || '').trim() === 'true',
      style_map:            {},
    };
  }

  const style = (name_category || 'General').trim();
  if (!categoryMap[slug].style_map[style]) {
    categoryMap[slug].style_map[style] = [];
  }
  categoryMap[slug].style_map[style].push({
    name:    name.trim(),
    tagline: (tagline || '').trim(),
    why:     (why || '').trim(),
  });
}

// Build final categories array
const categories = Object.values(categoryMap).map(cat => {
  const { style_map, ...rest } = cat;

  // Build name_groups in defined order, then any remaining styles
  const orderedStyles = [
    ...STYLE_ORDER.filter(s => style_map[s]),
    ...Object.keys(style_map).filter(s => !STYLE_ORDER.includes(s)),
  ];

  const name_groups = orderedStyles.map(style => ({
    style,
    label: STYLE_META[style]?.label || style,
    desc:  STYLE_META[style]?.desc  || '',
    names: style_map[style],
  }));

  const names = name_groups.flatMap(g => g.names);
  return { ...rest, name_groups, names };
});

const output = {
  generated_at: new Date().toISOString(),
  total_names:  categories.reduce((sum, c) => sum + c.names.length, 0),
  categories,
};

const outPath = path.resolve(__dirname, '../src/data/startup-names.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`✅  Generated ${output.total_names} names across ${categories.length} categories`);
console.log(`   Output → ${outPath}`);
