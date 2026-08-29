const fs = require('fs');

// 1. Update ContactCard.jsx
const jsxPath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/ContactCard/ContactCard.jsx';
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// Add MessageSquare to lucide-react imports
if (!jsxContent.includes('MessageSquare')) {
  jsxContent = jsxContent.replace('Check } from', 'Check, MessageSquare } from');
}

// Add Feedback to actions array
const oldActions = `  const actions = [
    { icon: Phone, label: 'Call', href: 'tel:+919842775676', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    { icon: Mail, label: 'Email', href: 'mailto:yogistudio2004@gmail.com', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { icon: MapPin, label: 'Directions', href: MAPS_URL, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  ];`;

const newActions = `  const actions = [
    { icon: Phone, label: 'Call', href: 'tel:+919842775676', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    { icon: Mail, label: 'Email', href: 'mailto:yogistudio2004@gmail.com', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { icon: MapPin, label: 'Directions', href: MAPS_URL, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    { icon: MessageSquare, label: 'Feedback', href: 'mailto:yogistudio2004@gmail.com?subject=Feedback', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  ];`;

jsxContent = jsxContent.replace(oldActions, newActions);

fs.writeFileSync(jsxPath, jsxContent, 'utf8');

// 2. Update ContactCard.css to reduce gap so 4 items fit
const cssPath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/ContactCard/ContactCard.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(
  /(\.cc-actions\s*\{\s*display:\s*flex;\s*justify-content:\s*center;\s*gap:\s*)2rem(;)/,
  '$11.25rem$2'
);

fs.writeFileSync(cssPath, cssContent, 'utf8');

console.log('Modified ContactCard for Feedback button');
