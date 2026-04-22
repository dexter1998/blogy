import './Marquee.css';

const LOGOS = [
  'Shopify', 'WordPress', 'Webflow', 'Wix', 'Ghost', 'Squarespace',
  'Framer', 'Notion', 'Medium', 'Sanity', 'Contentful', 'BigCommerce',
];

export default function Marquee() {
  return (
    <div className="marquee-wrap">
      <div className="marquee-label">Publishes natively to your stack</div>
      <div className="marquee-track-wrap">
        <div className="marquee-track">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span key={i} className="marquee-item">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
