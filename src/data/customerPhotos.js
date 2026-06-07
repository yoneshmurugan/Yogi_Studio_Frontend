// We keep a generic photo generator
const generatePhotos = (startIndex, count, folderPrefix) => {
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    return {
      id: `${folderPrefix}_${idx + 1}`,
      src: `https://picsum.photos/seed/cust${idx + 1}/800/600`,
      thumb: `https://picsum.photos/seed/cust${idx + 1}/400/300`,
      filename: `IMG_${String(1000 + idx + 1).padStart(4, '0')}.jpg`,
      aspect: [4/3, 3/4, 1, 16/9][idx % 4],
    };
  });
};

export const eventInfo = {
  coupleName: 'Sarah & James',
  eventName: 'The Henderson Wedding',
  eventDate: 'October 14, 2026',
  eventType: 'Wedding',
  photographerName: 'Yogi Nesh',
  package: 'Elite',
  totalPhotos: 36, // Combined total
  maxSelections: 200,
  photographerNote:
    'Browse through your special moments and select every photo that speaks to your heart. Mark ones you don\'t want with ✕ and your favourites with ❤️. There\'s no rush — take your time and relive the magic.',
};

export const mockFolders = [
  {
    id: 'f1',
    name: 'Getting Ready',
    photos: generatePhotos(0, 10, 'GR'),
  },
  {
    id: 'f2',
    name: 'Ceremony',
    photos: generatePhotos(10, 15, 'CE'),
  },
  {
    id: 'f3',
    name: 'Reception',
    photos: generatePhotos(25, 11, 'RE'),
  }
];

// For backward compatibility or global views, we can export a flattened list
const customerPhotos = mockFolders.flatMap(f => f.photos);
export default customerPhotos;
