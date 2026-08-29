const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/ContactCard/ContactCard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add import
const importStatement = `import { AppStoreButton, GooglePlayButton } from '../base/buttons/app-store-buttons';\n`;
if (!content.includes('app-store-buttons')) {
  content = content.replace(/import \{ Phone[^;]+;/, match => match + '\n' + importStatement);
}

// Remove the PlayStore and AppleIcon SVGs and the links from the links array
// Since the user wants to arrange them neatly, I'll add them to the bottom before the footer
content = content.replace(/const AppleIcon = [\s\S]*?<\/svg>\n\);\n\n/, '');
content = content.replace(/const PlayStoreIcon = [\s\S]*?<\/svg>\n\);\n/, '');
content = content.replace(/\s*\{\s*Icon:\s*\(\)\s*=>\s*<PlayStoreIcon[\s\S]*?\},/, '');
content = content.replace(/\s*\{\s*Icon:\s*\(\)\s*=>\s*<AppleIcon[\s\S]*?\},/, '');

// Add the buttons just above the Address section
const appsSection = `
        {/* ── Mobile Apps ── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-5 pb-6 pt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <GooglePlayButton size="md" className="w-full sm:w-auto" href="https://play.google.com/store/apps/details?id=com.yogistudio.app&pcampaignid=web_share" />
          <AppStoreButton size="md" className="w-full sm:w-auto" href="https://apps.apple.com/in/app/yogi-digital-studio/id6790760209" />
        </motion.div>

        {/* ── Address ── */}`;

content = content.replace(/\{\/\* ── Address ── \*\/\}/, appsSection);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Modified ContactCard.jsx');
