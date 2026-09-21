const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add getBytes to imports
content = content.replace(
  "import { ref, getDownloadURL } from 'firebase/storage';",
  "import { ref, getDownloadURL, getBytes } from 'firebase/storage';"
);

// 2. Update the config fetch to use getBytes instead of fetch to avoid CORS issues
const oldFetch = `      try {
        const configUrl = await getDownloadURL(ref(storage, \`events/\${eventId}/ai_config.json\`));
        const configRes = await fetch(configUrl);
        const configData = await configRes.json();
        setAllowShowAll(!!configData.allowShowAll);
      } catch (e) {
        setAllowShowAll(false);
      }`;

const newFetch = `      try {
        const configRef = ref(storage, \`events/\${eventId}/ai_config.json\`);
        const buffer = await getBytes(configRef);
        const text = new TextDecoder().decode(buffer);
        const configData = JSON.parse(text);
        setAllowShowAll(!!configData.allowShowAll);
      } catch (e) {
        setAllowShowAll(false);
      }`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  fs.writeFileSync(path, content);
  console.log("Patched FaceSearch config fetch for CORS!");
} else {
  console.log("Could not find the exact fetch block to replace!");
}
