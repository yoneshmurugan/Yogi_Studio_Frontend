const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Insert session helper at the top of the component
const sessionHelper = `  const getSavedSession = () => {
    try {
      const item = sessionStorage.getItem('faceSearchState');
      if (item) {
        const parsed = JSON.parse(item);
        const urlEvent = new URLSearchParams(window.location.search).get('eventId');
        if (urlEvent && parsed.eventId && urlEvent !== parsed.eventId) {
           sessionStorage.removeItem('faceSearchState');
           return null;
        }
        return parsed;
      }
    } catch(e) {}
    return null;
  };
  const savedState = typeof window !== 'undefined' ? getSavedSession() : null;
`;

content = content.replace('export default function FaceSearch() {', 'export default function FaceSearch() {\n' + sessionHelper);

// 2. Replace state initializations
content = content.replace("const [eventId, setEventId] = useState('');", "const [eventId, setEventId] = useState(savedState?.eventId || '');");
content = content.replace("const [status, setStatus] = useState('idle');", "const [status, setStatus] = useState(savedState?.status || 'idle');");
content = content.replace("const [allowShowAll, setAllowShowAll] = useState(false);", "const [allowShowAll, setAllowShowAll] = useState(savedState?.allowShowAll || false);");
content = content.replace("const [hasShownAll, setHasShownAll] = useState(false);", "const [hasShownAll, setHasShownAll] = useState(savedState?.hasShownAll || false);");
content = content.replace("const [matchedPhotos, setMatchedPhotos] = useState([]);", "const [matchedPhotos, setMatchedPhotos] = useState(savedState?.matchedPhotos || []);");

// 3. Add useEffect to persist state
const syncEffect = `
  useEffect(() => {
    if (eventId) {
      sessionStorage.setItem('faceSearchState', JSON.stringify({
        eventId,
        status,
        allowShowAll,
        hasShownAll,
        matchedPhotos
      }));
    }
  }, [eventId, status, allowShowAll, hasShownAll, matchedPhotos]);
`;

content = content.replace("  const [isSingleDownloading, setIsSingleDownloading] = useState(false);", "  const [isSingleDownloading, setIsSingleDownloading] = useState(false);\n" + syncEffect);

// 4. Update the URL Params useEffect to avoid overriding if already set correctly
const oldUrlEffect = `  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const event = urlParams.get('eventId');
    if (event) setEventId(event);
  }, []);`;
const newUrlEffect = `  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const event = urlParams.get('eventId');
    if (event && !savedState?.eventId) setEventId(event);
  }, []);`;
content = content.replace(oldUrlEffect, newUrlEffect);

// 5. Remove displayCount completely
content = content.replace("const [displayCount, setDisplayCount] = useState(60);\n  ", "");

// Let's replace the reset in 'handleValidateEventCode' and 'triggerCamera' 
// "setMatchedPhotos([]); setDisplayCount(60); setHasShownAll(false);" -> "setMatchedPhotos([]); setHasShownAll(false);"
content = content.replace(/setDisplayCount\(60\); /g, "");

// 6. Fix the masonry array slicing and remove Framer Motion for photos
const oldGalleryBlock = `                    {matchedPhotos.slice(0, displayCount)
                      .map((url, idx) => ({ url, originalIdx: idx }))
                      .filter((_, idx) => idx % columnsCount === colIdx)
                      .map(({ url, originalIdx }) => (
                        <motion.div
                          key={originalIdx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + originalIdx * 0.07, duration: 0.6, ease: 'easeOut' }}
                          className="w-full rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group relative shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                          onClick={() => setSelectedImageIdx(originalIdx)}
                        >
                          <img src={url} alt={\`Photo \${originalIdx + 1}\`} className="block w-full h-auto object-cover" />`;

const newGalleryBlock = `                    {matchedPhotos
                      .map((url, idx) => ({ url, originalIdx: idx }))
                      .filter((_, idx) => idx % columnsCount === colIdx)
                      .map(({ url, originalIdx }) => (
                        <div
                          key={originalIdx}
                          className="w-full rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group relative shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.01] duration-300"
                          onClick={() => setSelectedImageIdx(originalIdx)}
                        >
                          <img src={url} loading="lazy" alt={\`Photo \${originalIdx + 1}\`} className="block w-full h-auto object-cover" />`;
content = content.replace(oldGalleryBlock, newGalleryBlock);

// 7. Remove the closing </motion.div> for the gallery items
// Find the exact closing motion.div inside the masonry column mapping
const closingMotionOld = `                            </span>
                          </div>
                        </motion.div>`;
const closingMotionNew = `                            </span>
                          </div>
                        </div>`;
content = content.replace(closingMotionOld, closingMotionNew); // For Col 1... wait, replaceAll?
content = content.split(closingMotionOld).join(closingMotionNew);

// 8. Remove the Load More button
const loadMoreBtn = `              {displayCount < matchedPhotos.length && (
                <div className="w-full flex justify-center mt-12 mb-4">
                  <button 
                    onClick={() => setDisplayCount(prev => prev + 60)}
                    className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    Load More Photos
                  </button>
                </div>
              )}`;
content = content.replace(loadMoreBtn, "");

fs.writeFileSync(path, content);
console.log("Patched FaceSearch!");
