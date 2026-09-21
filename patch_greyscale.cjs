const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add state
content = content.replace(
  "const [allowShowAll, setAllowShowAll] = useState(false);",
  "const [allowShowAll, setAllowShowAll] = useState(false);\n  const [hasShownAll, setHasShownAll] = useState(false);"
);

// 2. Set state in handler
content = content.replace(
  "setMatchedPhotos((data.photos || []).map(p => p.photoUrl));",
  "setMatchedPhotos((data.photos || []).map(p => p.photoUrl));\n      setHasShownAll(true);"
);

// 3. Reset state when starting new search
content = content.replace(
  "setErrorMsg(''); setStatus('checking'); setMatchedPhotos([]); setDisplayCount(60);",
  "setErrorMsg(''); setStatus('checking'); setMatchedPhotos([]); setDisplayCount(60); setHasShownAll(false);"
);

// 4. Update Button 1
const oldBtn1 = `<button
                      onClick={handleShowAllImages}
                      className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-gray-300 text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                      Show All Event Images
                    </button>`;
const newBtn1 = `<button
                      onClick={handleShowAllImages}
                      disabled={hasShownAll}
                      className={\`px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-sm font-medium rounded-full transition-colors shadow-sm \${hasShownAll ? 'text-gray-600 opacity-50 grayscale cursor-not-allowed' : 'text-gray-300 hover:bg-zinc-800'}\`}
                    >
                      Show All Event Images
                    </button>`;
content = content.replace(oldBtn1, newBtn1);

// 5. Update Button 2
const oldBtn2 = `<button
                    onClick={handleShowAllImages}
                    className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors shadow-sm w-full md:w-auto"
                  >
                    View All Event Images
                  </button>`;
const newBtn2 = `<button
                    onClick={handleShowAllImages}
                    disabled={hasShownAll}
                    className={\`px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-sm font-medium rounded-full transition-colors shadow-sm w-full md:w-auto \${hasShownAll ? 'text-gray-500 opacity-50 grayscale cursor-not-allowed' : 'text-white hover:bg-zinc-700'}\`}
                  >
                    View All Event Images
                  </button>`;
content = content.replace(oldBtn2, newBtn2);

fs.writeFileSync(path, content);
console.log("Patched buttons to be disabled/greyscaled after clicking!");
