const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add state isLoadingAll
content = content.replace(
  "const [hasShownAll, setHasShownAll] = useState(savedState?.hasShownAll || false);",
  "const [hasShownAll, setHasShownAll] = useState(savedState?.hasShownAll || false);\n  const [isLoadingAll, setIsLoadingAll] = useState(false);"
);

// 2. Modify handleShowAllImages
const oldHandler = `  const handleShowAllImages = async () => {
    setStatus('checking');
    setErrorMsg('');
    try {
      const indexRef = ref(storage, \`events/\${eventId}/face_index.json\`);
      const buffer = await getBytes(indexRef);
      const text = new TextDecoder().decode(buffer);
      const data = JSON.parse(text);
      setMatchedPhotos((data.photos || []).map(p => p.photoUrl));
      setHasShownAll(true);
      setStatus('complete');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch(err) {
      setErrorMsg("Failed to load images.");
      setStatus('idle');
    }
  };`;

const newHandler = `  const handleShowAllImages = async () => {
    setIsLoadingAll(true);
    // Add 15 second delay as requested
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    setStatus('checking');
    setErrorMsg('');
    try {
      const indexRef = ref(storage, \`events/\${eventId}/face_index.json\`);
      const buffer = await getBytes(indexRef);
      const text = new TextDecoder().decode(buffer);
      const data = JSON.parse(text);
      setMatchedPhotos((data.photos || []).map(p => p.photoUrl));
      setHasShownAll(true);
      setStatus('complete');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch(err) {
      setErrorMsg("Failed to load images.");
      setStatus('idle');
    } finally {
      setIsLoadingAll(false);
    }
  };`;

content = content.replace(oldHandler, newHandler);

// 3. Update Button 1
const oldBtn1 = `<button
                      onClick={handleShowAllImages}
                      disabled={hasShownAll}
                      className={\`px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-sm font-medium rounded-full transition-colors shadow-sm \${hasShownAll ? 'text-gray-600 opacity-50 grayscale cursor-not-allowed' : 'text-gray-300 hover:bg-zinc-800'}\`}
                    >
                      Show All Event Images
                    </button>`;

const newBtn1 = `<button
                      onClick={handleShowAllImages}
                      disabled={hasShownAll || isLoadingAll}
                      className={\`px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-sm font-medium rounded-full transition-colors shadow-sm \${hasShownAll ? 'text-gray-600 opacity-50 grayscale cursor-not-allowed' : 'text-gray-300 hover:bg-zinc-800'}\`}
                    >
                      {isLoadingAll ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-gold" />
                          <span>Loading Photos...</span>
                        </div>
                      ) : (
                        "Show All Event Images"
                      )}
                    </button>`;

content = content.replace(oldBtn1, newBtn1);

// 4. Update Button 2
const oldBtn2 = `<button
                    onClick={handleShowAllImages}
                    disabled={hasShownAll}
                    className={\`px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-sm font-medium rounded-full transition-colors shadow-sm w-full md:w-auto \${hasShownAll ? 'text-gray-500 opacity-50 grayscale cursor-not-allowed' : 'text-white hover:bg-zinc-700'}\`}
                  >
                    View All Event Images
                  </button>`;

const newBtn2 = `<button
                    onClick={handleShowAllImages}
                    disabled={hasShownAll || isLoadingAll}
                    className={\`px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-sm font-medium rounded-full transition-colors shadow-sm w-full md:w-auto \${hasShownAll ? 'text-gray-500 opacity-50 grayscale cursor-not-allowed' : 'text-white hover:bg-zinc-700'}\`}
                  >
                    {isLoadingAll ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Loading Photos...</span>
                      </div>
                    ) : (
                      "View All Event Images"
                    )}
                  </button>`;

content = content.replace(oldBtn2, newBtn2);

fs.writeFileSync(path, content);
console.log("Patched loader and delay successfully!");
