const fs = require('fs');
const filePath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/Landing/ContactPage.jsx';
if (fs.existsSync(filePath)) {
  console.log(fs.readFileSync(filePath, 'utf8').substring(0, 5000));
} else {
  console.log('ContactPage.jsx not found');
}
