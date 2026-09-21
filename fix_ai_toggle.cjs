const fs = require('fs');

const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Admin/AIPhotoModel.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldUI = `<div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareLink(event.id)}`;

const newUI = `<div className="flex items-center gap-2">
                  <div className="flex items-center mr-2 md:mr-4 border-r border-zinc-800 pr-2 md:pr-4" title="Allow Client 'Show All' Override">
                    <span className="text-gray-400 text-xs mr-3 hidden sm:inline font-medium">Show All:</span>
                    <button 
                      onClick={() => toggleShowAll(event.id, event.allowShowAll)}
                      className={\`w-9 h-5 rounded-full relative transition-colors duration-300 \${event.allowShowAll ? 'bg-gold' : 'bg-zinc-700'}\`}
                    >
                      <motion.div 
                        className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] shadow-sm"
                        animate={{ left: event.allowShowAll ? 'calc(100% - 14px - 3px)' : '3px' }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() => handleShareLink(event.id)}`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(path, content);
console.log("Fixed UI toggle position!");
