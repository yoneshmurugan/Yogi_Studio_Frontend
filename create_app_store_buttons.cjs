const fs = require('fs');
const content = `import React from 'react';

const BaseButton = ({ icon, subtitle, title, href, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 h-10 gap-2",
    md: "px-4 py-2 h-12 gap-3",
    lg: "px-5 py-3 h-14 gap-3",
  };

  const textClasses = {
    sm: { sub: "text-[8px]", title: "text-xs" },
    md: { sub: "text-[10px]", title: "text-sm" },
    lg: { sub: "text-xs", title: "text-base" },
  };

  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={\`flex items-center bg-black/40 hover:bg-gold/10 text-white border border-white/5 hover:border-gold/30 rounded-xl transition-all shadow-md hover:shadow-gold/5 \${sizeClasses[size]} \${className} group\`}
    >
      <div className="flex-shrink-0 flex items-center justify-center text-silver group-hover:text-gold transition-colors">
        {icon}
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className={\`leading-none uppercase tracking-[0.1em] text-silver/60 group-hover:text-gold/80 transition-colors font-medium mb-0.5 \${textClasses[size].sub}\`}>
          {subtitle}
        </span>
        <span className={\`leading-none font-medium tracking-wide text-white group-hover:text-gold transition-colors \${textClasses[size].title}\`}>
          {title}
        </span>
      </div>
    </a>
  );
};

export const AppStoreButton = ({ size = "md", href, className }) => (
  <BaseButton
    size={size}
    href={href}
    className={className}
    subtitle="Download on the"
    title="App Store"
    icon={
      <svg viewBox="0 0 384 512" fill="currentColor" className={size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}>
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
    }
  />
);

export const GooglePlayButton = ({ size = "md", href, className }) => (
  <BaseButton
    size={size}
    href={href}
    className={className}
    subtitle="GET IT ON"
    title="Google Play"
    icon={
      <svg viewBox="0 0 24 24" fill="none" className={size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}>
        <path d="M2.528 2.528C2.189 2.87 2 3.398 2 4.092V19.908C2 20.602 2.189 21.13 2.528 21.472L2.612 21.552L12.593 11.571V11.411L2.612 2.428L2.528 2.528Z" fill="#3FCC28"/>
        <path d="M15.918 14.896L12.593 11.571V11.41L15.918 8.085L16.035 8.152L19.97 10.395C21.095 11.036 21.095 12.091 19.97 12.735L16.035 14.829L15.918 14.896Z" fill="#FFC82C"/>
        <path d="M16.035 14.83L12.592 11.488L2.528 21.552C2.932 21.968 3.593 22.016 4.398 21.552L16.035 14.83Z" fill="#F03738"/>
        <path d="M16.035 8.152L4.398 1.433C3.593 0.969 2.932 1.018 2.528 1.433L12.592 11.498L16.035 8.152Z" fill="#2196F3"/>
      </svg>
    }
  />
);

export const GalaxyStoreButton = ({ size = "md", href, className }) => (
  <BaseButton
    size={size}
    href={href}
    className={className}
    subtitle="AVAILABLE ON"
    title="Galaxy Store"
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor" className={size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}>
         <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.924 14.673l-1.996-1.554a6.565 6.565 0 01-2.923.68c-1.897 0-3.447-.84-4.57-2.31l1.83-1.424c.738 1.05 1.583 1.543 2.766 1.543 1.002 0 1.636-.454 1.636-1.196 0-.613-.396-1.002-2.112-1.396-2.164-.528-3.43-1.293-3.43-2.903 0-1.874 1.478-3.114 3.695-3.114 1.847 0 3.193.712 4.195 2.058l-1.768 1.478c-.713-.976-1.478-1.372-2.428-1.372-1.003 0-1.583.475-1.583 1.055 0 .607.396.95 2.085 1.346 2.375.528 3.51 1.267 3.51 2.903 0 1.98-1.45 3.167-3.668 3.167a6.222 6.222 0 01-1.848-.284l1.61 2.072c.317.408.87.528 1.346.237l1.662-1.002v-1.98z"/>
      </svg>
    }
  />
);
`;

fs.writeFileSync('/Users/yonesh/Projects/Yogi_Studio/Yogi_Studio_Frontend/src/components/base/buttons/app-store-buttons.jsx', content, 'utf8');
console.log('Created app-store-buttons.jsx');
