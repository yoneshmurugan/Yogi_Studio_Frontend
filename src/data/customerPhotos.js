// Extended photo data with richer metadata
const customerPhotos = Array.from({ length: 36 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/cust${i + 1}/800/600`,
  thumb: `https://picsum.photos/seed/cust${i + 1}/400/300`,
  filename: `IMG_${String(1000 + i + 1).padStart(4, '0')}.jpg`,
  // Vary aspect ratios for visual interest
  aspect: [4/3, 3/4, 1, 16/9][i % 4],
}));

export const eventInfo = {
  coupleName: 'Sarah & James',
  eventName: 'The Henderson Wedding',
  eventDate: 'October 14, 2026',
  eventType: 'Wedding',
  photographerName: 'Yogi Nesh',
  package: 'Elite',
  totalPhotos: 36,
  maxSelections: 200,
  photographerNote:
    'Browse through your special moments and select every photo that speaks to your heart. Mark ones you don\'t want with ✕ and your favourites with ❤️. There\'s no rush — take your time and relive the magic.',
};

export default customerPhotos;
