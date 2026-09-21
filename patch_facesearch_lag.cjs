const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Fix photoUrl mapping
content = content.replace(
  'setMatchedPhotos((data.photos || []).map(p => p.url));',
  'setMatchedPhotos((data.photos || []).map(p => p.photoUrl));'
);

// 2. Add displayCount state
content = content.replace(
  "const [allowShowAll, setAllowShowAll] = useState(false);",
  "const [allowShowAll, setAllowShowAll] = useState(false);\n  const [displayCount, setDisplayCount] = useState(60);"
);

// 3. Reset displayCount when starting a search
content = content.replace(
  "setErrorMsg(''); setStatus('checking'); setMatchedPhotos([]);",
  "setErrorMsg(''); setStatus('checking'); setMatchedPhotos([]); setDisplayCount(60);"
);

// 4. Update the Masonry Gallery mapping to use slice(0, displayCount)
// Current: {matchedPhotos.map((url, idx) => ({ url, originalIdx: idx })).filter((_, idx) => idx % columnsCount === colIdx).map(({ url, originalIdx }) => (
const oldMap = `                    {matchedPhotos
                      .map((url, idx) => ({ url, originalIdx: idx }))
                      .filter((_, idx) => idx % columnsCount === colIdx)
                      .map(({ url, originalIdx }) => (`

const newMap = `                    {matchedPhotos.slice(0, displayCount)
                      .map((url, idx) => ({ url, originalIdx: idx }))
                      .filter((_, idx) => idx % columnsCount === colIdx)
                      .map(({ url, originalIdx }) => (`

content = content.replace(oldMap, newMap);

// 5. Add Load More Button below Masonry Gallery
const galleryEnd = `              </div>

              {/* Bottom branding & CTA */}`;

const loadMoreBtn = `              </div>
              
              {displayCount < matchedPhotos.length && (
                <div className="w-full flex justify-center mt-12 mb-4">
                  <button 
                    onClick={() => setDisplayCount(prev => prev + 60)}
                    className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    Load More Photos
                  </button>
                </div>
              )}

              {/* Bottom branding & CTA */}`;

content = content.replace(galleryEnd, loadMoreBtn);

fs.writeFileSync(path, content);
console.log("Patched FaceSearch lag & broken images!");
