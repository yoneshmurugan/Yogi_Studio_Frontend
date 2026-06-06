const customerPhotos = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/cust${i + 1}/400/400`,
  filename: `IMG_${String(1000 + i + 1).padStart(4, '0')}.jpg`,
}));

export const eventInfo = {
  coupleName: 'Sarah & James',
  eventName: 'The Henderson Wedding',
  eventDate: 'October 14, 2026',
  totalPhotos: 30,
  maxSelections: 200,
  photographerNote: 'Please select your favorite moments from the day. You may choose up to 200 photographs for your final album.',
};

export default customerPhotos;
