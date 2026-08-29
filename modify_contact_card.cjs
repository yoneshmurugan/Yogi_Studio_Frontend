const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/ContactCard/ContactCard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const iconsToAdd = `
const AppleIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C12 2 12 2 12 2c-.81 0-1.74.45-2.28 1.1-.45.54-.84 1.41-.84 2.25 0 .09.03.15.03.24.87.03 1.83-.45 2.37-1.11.48-.54.84-1.38.84-2.25 0-.09-.03-.18-.03-.27C12 2 12 2 12 2zm-.54 4.5c-1.47 0-2.61.96-3.3 1.23-1.68.6-3.81 1.26-4.65 2.61-1.35 2.25-1.14 5.25.12 7.23 1.29 2.04 3.03 3.63 4.95 3.63.78 0 1.5-.27 2.22-.63.81-.39 1.68-.66 2.58-.66s1.77.27 2.58.66c.72.36 1.44.63 2.22.63 1.92 0 3.66-1.59 4.95-3.63 1.26-1.98 1.47-4.98.12-7.23-.84-1.35-2.97-2.01-4.65-2.61-.69-.27-1.83-1.23-3.3-1.23-1.11 0-2.31.54-3.3.54-1 0-2.19-.54-3.3-.54z" />
  </svg>
);

const PlayStoreIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 12L3.5 22V2L21.5 12Z"/>
    <path d="M3.5 2L15 12"/>
    <path d="M3.5 22L15 12"/>
  </svg>
);
`;

const linksToAdd = `
    {
      Icon: () => <PlayStoreIcon size={18} color="#fff" />,
      label: 'Get it on Play Store',
      sub: 'Yogi Digital Studio App',
      href: 'https://play.google.com/store/apps/details?id=com.yogistudio.app&pcampaignid=web_share',
      gradient: 'linear-gradient(135deg, #34A853, #0F9D58)',
    },
    {
      Icon: () => <AppleIcon size={18} color="#fff" />,
      label: 'Download on App Store',
      sub: 'Yogi Digital Studio App',
      href: 'https://apps.apple.com/in/app/yogi-digital-studio/id6790760209',
      gradient: 'linear-gradient(135deg, #000000, #333333)',
    },`;

content = content.replace('const YoutubeIcon', iconsToAdd + '\nconst YoutubeIcon');
content = content.replace('  const links = [', '  const links = [' + linksToAdd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Modified ContactCard.jsx');
