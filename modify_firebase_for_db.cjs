const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/lib/firebase.js';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('getFirestore')) {
  content = content.replace("import { getStorage } from 'firebase/storage';", "import { getStorage } from 'firebase/storage';\nimport { getFirestore } from 'firebase/firestore';");
  content += "\nexport const db = getFirestore(app);\n";
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added db to firebase.js');
} else {
  console.log('db already in firebase.js');
}
