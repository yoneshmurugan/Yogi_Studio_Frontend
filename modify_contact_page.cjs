const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Landing/ContactPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const importStatement = `import { AppStoreButton, GooglePlayButton } from '../base/buttons/app-store-buttons';\n`;
if (!content.includes('app-store-buttons')) {
  content = content.replace(/import \{ MapPin[^;]+;/, match => match + '\n' + importStatement);
}

const appsSection = `
              <div className="pt-6 mt-6 border-t border-white/10">
                <h3 className="text-silver/80 text-sm tracking-[0.1em] uppercase mb-6 text-center lg:text-left">Download Our App</h3>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <GooglePlayButton href="https://play.google.com/store/apps/details?id=com.yogistudio.app&pcampaignid=web_share" />
                  <AppStoreButton href="https://apps.apple.com/in/app/yogi-digital-studio/id6790760209" />
                </div>
              </div>
            </div>
          </ScrollReveal>`;

// We previously added a custom apps block, let's remove it and replace it with the new components
content = content.replace(/<div className="pt-6 mt-6 border-t border-white\/10">[\s\S]*?<\/ScrollReveal>/, appsSection);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Modified ContactPage.jsx');
