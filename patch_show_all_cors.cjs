const fs = require('fs');
const path = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Customer/FaceSearch.jsx';

let content = fs.readFileSync(path, 'utf8');

const oldShowAll = `      const indexUrl = await getDownloadURL(ref(storage, \`events/\${eventId}/face_index.json\`));
      const res = await fetch(indexUrl);
      const data = await res.json();`;

const newShowAll = `      const indexRef = ref(storage, \`events/\${eventId}/face_index.json\`);
      const buffer = await getBytes(indexRef);
      const text = new TextDecoder().decode(buffer);
      const data = JSON.parse(text);`;

if (content.includes(oldShowAll)) {
  content = content.replace(oldShowAll, newShowAll);
  fs.writeFileSync(path, content);
  console.log("Patched handleShowAllImages for CORS!");
} else {
  console.log("Could not find the exact show all fetch block!");
}
