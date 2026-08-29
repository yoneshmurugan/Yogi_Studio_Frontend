const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Landing/ContactPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add Smartphone to lucide-react imports if not there
if (!content.includes('Smartphone')) {
  content = content.replace('MapPin, Phone, Mail', 'MapPin, Phone, Mail, Smartphone, Download');
}

const appsSection = `
              <div className="pt-6 mt-6 border-t border-white/10">
                <h3 className="text-silver/80 text-sm tracking-[0.1em] uppercase mb-4">Download Our App</h3>
                <div className="flex flex-col gap-4">
                  <a href="https://play.google.com/store/apps/details?id=com.yogistudio.app&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group bg-black/40 hover:bg-gold/10 p-4 rounded-xl border border-white/5 hover:border-gold/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-silver group-hover:text-gold transition-colors">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-gold transition-colors">Get it on Google Play</p>
                      <p className="text-silver/60 text-xs">Yogi Digital Studio</p>
                    </div>
                  </a>
                  <a href="https://apps.apple.com/in/app/yogi-digital-studio/id6790760209" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group bg-black/40 hover:bg-gold/10 p-4 rounded-xl border border-white/5 hover:border-gold/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-silver group-hover:text-gold transition-colors">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-gold transition-colors">Download on the App Store</p>
                      <p className="text-silver/60 text-xs">Yogi Digital Studio</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>`;

content = content.replace('            </div>\n          </ScrollReveal>', appsSection);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Modified ContactPage.jsx');
