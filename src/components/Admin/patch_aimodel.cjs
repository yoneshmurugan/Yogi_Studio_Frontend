const fs = require('fs');

let content = fs.readFileSync('/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Admin/AIPhotoModel.jsx', 'utf8');

const oldFetch = `            const url = await getDownloadURL(indexRef);
            const res = await fetch(url);
            const data = await res.json();
            
            return {
              id: eventName,
              photoCount: data.photos ? data.photos.length : 0,
              totalSizeBytes: data.totalSizeBytes || null
            };`;

const newFetch = `            const url = await getDownloadURL(indexRef);
            const res = await fetch(url);
            const data = await res.json();
            
            let allowShowAll = false;
            try {
              const configRef = ref(storage, \`events/\${eventName}/ai_config.json\`);
              const configUrl = await getDownloadURL(configRef);
              const configRes = await fetch(configUrl);
              const configData = await configRes.json();
              allowShowAll = !!configData.allowShowAll;
            } catch (e) {}
            
            return {
              id: eventName,
              photoCount: data.photos ? data.photos.length : 0,
              totalSizeBytes: data.totalSizeBytes || null,
              allowShowAll
            };`;

content = content.replace(oldFetch, newFetch);

const toggleFunc = `
  const toggleShowAll = async (eventName, currentVal) => {
    try {
      const configRef = ref(storage, \`events/\${eventName}/ai_config.json\`);
      const newVal = !currentVal;
      const blob = new Blob([JSON.stringify({ allowShowAll: newVal })], { type: 'application/json' });
      await uploadBytes(configRef, blob);
      setIndexedEvents(prev => prev.map(ev => ev.id === eventName ? { ...ev, allowShowAll: newVal } : ev));
    } catch (e) {
      console.error('Failed to toggle allowShowAll', e);
    }
  };
`;
content = content.replace('const confirmDelete = async () => {', toggleFunc + '\n  const confirmDelete = async () => {');


const uiOld = `                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <FileJson className="w-4 h-4 mr-2 text-indigo-400" />
                      {ev.totalSizeBytes ? (ev.totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'Size Unknown'}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(ev.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-400/10"
                      title="Delete AI Index"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>`;

const uiNew = `                  <div className="mt-4 flex flex-col space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-400">
                      <div className="flex items-center">
                        <FileJson className="w-4 h-4 mr-2 text-indigo-400" />
                        {ev.totalSizeBytes ? (ev.totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'Size Unknown'}
                      </div>
                      
                      <button
                        onClick={() => setDeleteConfirm(ev.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-400/10"
                        title="Delete AI Index"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                      <span className="text-gray-300 text-xs font-medium">Allow Client "Show All" Override</span>
                      <button 
                        onClick={() => toggleShowAll(ev.id, ev.allowShowAll)}
                        className={\`w-10 h-5 rounded-full relative transition-colors duration-300 \${ev.allowShowAll ? 'bg-gold' : 'bg-gray-600'}\`}
                      >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
                          animate={{ left: ev.allowShowAll ? 'calc(100% - 1.125rem)' : '0.125rem' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>`;

content = content.replace(uiOld, uiNew);

fs.writeFileSync('/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Admin/AIPhotoModel.jsx', content);
console.log("Patched AIPhotoModel!");
