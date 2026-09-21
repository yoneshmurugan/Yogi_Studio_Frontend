const fs = require('fs');

let content = fs.readFileSync('/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx', 'utf8');

// 1. Add allowShowAll state
content = content.replace(
  "const [errorMsg, setErrorMsg] = useState('');",
  "const [errorMsg, setErrorMsg] = useState('');\n  const [allowShowAll, setAllowShowAll] = useState(false);"
);

// 2. Add handleShowAllImages
const handleShowAllImages = `
  const handleShowAllImages = async () => {
    setStatus('checking');
    setErrorMsg('');
    try {
      const indexUrl = await getDownloadURL(ref(storage, \`events/\${eventId}/face_index.json\`));
      const res = await fetch(indexUrl);
      const data = await res.json();
      setMatchedPhotos((data.photos || []).map(p => p.url));
      setStatus('complete');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch(err) {
      setErrorMsg("Failed to load images.");
      setStatus('idle');
    }
  };
`;
content = content.replace('const triggerCamera = async () => {', handleShowAllImages + '\n  const triggerCamera = async () => {');


// 3. Update triggerCamera to fetch ai_config.json
const oldTrigger = `      // Validate Event exists before opening camera
      await getDownloadURL(ref(storage, \`events/\${eventId}/face_index.json\`));`;

const newTrigger = `      // Validate Event exists before opening camera
      await getDownloadURL(ref(storage, \`events/\${eventId}/face_index.json\`));
      
      try {
        const configUrl = await getDownloadURL(ref(storage, \`events/\${eventId}/ai_config.json\`));
        const configRes = await fetch(configUrl);
        const configData = await configRes.json();
        setAllowShowAll(!!configData.allowShowAll);
      } catch (e) {
        setAllowShowAll(false);
      }`;
content = content.replace(oldTrigger, newTrigger);


// 4. Add the button in Bottom branding & CTA (for matches > 0)
const oldBranding = `<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent mb-6" />`;
const newBranding = `<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent mb-6" />
                
                {allowShowAll && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                    <button
                      onClick={handleShowAllImages}
                      className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-gray-300 text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                      Show All Event Images
                    </button>
                  </motion.div>
                )}
`;
content = content.replace(oldBranding, newBranding);


// 5. Add the button in "No matches" area (for matches === 0)
const oldNoMatches = `We couldn't find your face in this event. Try with better lighting or a clearer photo.
              </p>
            </motion.div>`;
const newNoMatches = `We couldn't find your face in this event. Try with better lighting or a clearer photo.
              </p>
              
              {allowShowAll && (
                <div className="mt-6">
                  <button
                    onClick={handleShowAllImages}
                    className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors shadow-sm w-full md:w-auto"
                  >
                    View All Event Images
                  </button>
                </div>
              )}
            </motion.div>`;
content = content.replace(oldNoMatches, newNoMatches);

fs.writeFileSync('/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx', content);
console.log("Patched FaceSearch!");
