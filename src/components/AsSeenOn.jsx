import './AsSeenOn.css';

const PLATFORMS = [
  {
    name: 'Product Hunt',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#DA552F"/>
        <path d="M22.5 20a2.5 2.5 0 010 5H17v-5h5.5zm0-8H17v8h5.5a5 5 0 100-8z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'G2',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#FF492C"/>
        <text x="7" y="28" fontFamily="Arial" fontWeight="900" fontSize="22" fill="#fff">G2</text>
      </svg>
    ),
  },
  {
    name: 'Capterra',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#fff" stroke="#e2e8f0"/>
        <path d="M8 20L20 8l7 7-12 12-7-7z" fill="#FF3D2E"/>
        <path d="M20 8l12 12-7 7L20 8z" fill="#00C2EA"/>
        <path d="M8 20l7 7 5-5-5-5-7 3z" fill="#68C5ED"/>
        <path d="M32 20L20 8l-5 5 5 5 12 2z" fill="#FF3D2E" opacity=".5"/>
      </svg>
    ),
  },
  {
    name: 'Trustpilot',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#00B67A"/>
        <path d="M20 9l2.83 8.72H32l-7.41 5.38 2.83 8.71L20 26.44l-7.41 5.37 2.83-8.71L8 17.72h9.17L20 9z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'AppSumo',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#FFBE00"/>
        <text x="6" y="27" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#1a1a1a">App</text>
        <text x="6" y="36" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#1a1a1a">Sumo</text>
      </svg>
    ),
  },
  {
    name: 'YC',
    icon: (
      <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
        <rect width="40" height="40" rx="10" fill="#FF6600"/>
        <text x="9" y="28" fontFamily="Arial" fontWeight="900" fontSize="20" fill="#fff">Y</text>
      </svg>
    ),
  },
];

export default function AsSeenOn() {
  return (
    <section className="aso-section">
      <div className="container">
        <p className="aso-label">Trusted &amp; featured on</p>
        <div className="aso-strip">
          {PLATFORMS.map((p, i) => (
            <div key={i} className="aso-item">
              {p.icon}
              <span className="aso-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
