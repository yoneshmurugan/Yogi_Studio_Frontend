const fs = require('fs');

const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Admin/AIPhotoModel.jsx';
let content = fs.readFileSync(path, 'utf8');

const duplicateBlock = `
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

// Replace the first occurrence of DOUBLE duplicate block with SINGLE
content = content.replace(duplicateBlock + duplicateBlock, duplicateBlock);

fs.writeFileSync(path, content);
console.log("Fixed duplicate function!");
