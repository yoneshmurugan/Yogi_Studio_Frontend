const fs = require('fs');

const jsxPath = '/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/ContactCard/ContactCard.jsx';
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// 1. Remove states
jsxContent = jsxContent.replace(/  const \[showFeedback, setShowFeedback\] = useState\(false\);\n  const \[rating, setRating\] = useState\(0\);\n  const \[feedbackText, setFeedbackText\] = useState\(''\);\n  const \[isSubmitting, setIsSubmitting\] = useState\(false\);\n  const \[feedbackSuccess, setFeedbackSuccess\] = useState\(false\);\n/g, '');

// 2. Remove handleFeedbackSubmit
jsxContent = jsxContent.replace(/  const handleFeedbackSubmit = async \(e\) => \{[\s\S]*?  \};\n\n/g, '');

// 3. Remove Feedback Modal JSX
jsxContent = jsxContent.replace(/        \{\/\* ── Feedback Modal ── \*\/\}[\s\S]*?        \{\/\* ── Cover ── \*\/\}/g, '        {/* ── Cover ── */}');

// 4. Restore actions array entry
jsxContent = jsxContent.replace(
  /\{ icon: MessageSquare, label: 'Feedback', onClick: \(\) => setShowFeedback\(true\), gradient: 'linear-gradient\(135deg, #8b5cf6, #6d28d9\)' \},/g,
  "{ icon: MessageSquare, label: 'Feedback', href: 'https://search.google.com/local/writereview?placeid=ChIJr8W8J1nqrjoR637iT00U038', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },"
); // Note: using a generic search write review link as placeholder

// 5. Restore actions mapping
const oldMapping = `          {actions.map(({ icon: Icon, label, href, onClick, gradient }, i) => {
            const Element = href ? motion.a : motion.button;
            return (
              <Element
                key={label}
                href={href}
                onClick={onClick}
                target={label === 'Directions' ? '_blank' : undefined}
                rel="noreferrer"
                className="cc-action-btn"
                whileTap={{ scale: 0.88 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              >
                <div className="cc-action-circle" style={{ background: gradient }}>
                  <Icon size={20} color="#fff" />
                </div>
                <span className="cc-action-label">{label}</span>
              </Element>
            );
          })}`;

const newMapping = `          {actions.map(({ icon: Icon, label, href, gradient }, i) => (
            <motion.a
              key={label}
              href={href}
              target={label === 'Directions' ? '_blank' : undefined}
              rel="noreferrer"
              className="cc-action-btn"
              whileTap={{ scale: 0.88 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <div className="cc-action-circle" style={{ background: gradient }}>
                <Icon size={20} color="#fff" />
              </div>
              <span className="cc-action-label">{label}</span>
            </motion.a>
          ))}`;

jsxContent = jsxContent.replace(oldMapping, newMapping);

// 6. Clean up imports
jsxContent = jsxContent.replace('MessageSquare, Star, X', 'MessageSquare');

fs.writeFileSync(jsxPath, jsxContent, 'utf8');
console.log('Reverted ContactCard.jsx');
