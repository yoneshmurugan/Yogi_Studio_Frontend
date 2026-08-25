export const generateVCard = () => {
  const vCardText = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Yogibalu',
    'N:Yogibalu;;;;',
    'ORG:Yogi Digital Studio',
    'TITLE:Photographer & Videographer',
    'TEL;TYPE=WORK,VOICE:+919842775676',
    'EMAIL;TYPE=PREF,INTERNET:yogistudio2004@gmail.com',
    'URL;TYPE=Website:https://yogidigitalstudio.in',
    'URL;TYPE=Instagram:https://www.instagram.com/yogistudio_official/',
    'URL;TYPE=YouTube:https://www.youtube.com/@yogistudio-official',
    'ADR;TYPE=WORK,PREF:;;H 96 Shop no 4 Periyar Nagar Main Road 80 feet Corner;Erode;Tamil Nadu;638001;India',
    'END:VCARD',
  ].join('\n');

  const blob = new Blob([vCardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'YogiDigitalStudio.vcf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
