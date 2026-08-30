import { Human } from '@vladmandic/human';

// The Human library uses advanced MobileFaceNet and BlazeFace models.
const config = {
  // Use jsdelivr CDN to load weights dynamically
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
  face: {
    enabled: true,
    detector: { 
      rotation: true, // Handles angled faces
      return: true, 
      maxDetected: 50 // For group event photos
    },
    mesh: { enabled: true }, // Required for accurate alignment before description
    description: { enabled: true }, // Extracts 1024-d face embedding
    iris: { enabled: false },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false }
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  // Optional pre-processing
  filter: { enabled: true, equalization: true } // Helps with poor lighting
};

let human = null;
let liveHuman = null;

let initPromise = null;
let liveInitPromise = null;

/**
 * Initializes the AI engine and loads the WebGL models.
 * Uses a promise lock to prevent race conditions during bulk uploads.
 */
export const initializeFaceApi = async () => {
  if (human) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const h = new Human(config);
      await h.load(); // Fetch models
      await h.warmup(); // Warmup GPU
      human = h;
      console.log('Human AI (Admin) initialized successfully.');
    } catch (error) {
      initPromise = null;
      console.error('Error initializing Human AI:', error);
      throw error;
    }
  })();

  return initPromise;
};

/**
 * Extracts 1024-d face descriptors for all faces found in an image element.
 * Useful for the Admin batch processing.
 */
export const extractAllFaces = async (input) => {
  if (!human) await initializeFaceApi();

  console.log('Human AI: Starting face detection...');
  const res = await human.detect(input);

  console.log(`Human AI: Found ${res.face.length} faces.`);
  // Return the 1024-d float array (embedding)
  return res.face.map(f => f.embedding);
};

/**
 * Extracts a single 1024-d face descriptor for the largest face found in an image.
 * Useful for the Attendee selfie capture.
 */
export const extractSingleFace = async (input) => {
  if (!human) await initializeFaceApi();

  const res = await human.detect(input);
  if (!res || !res.face || res.face.length === 0) return null;

  // Sort by largest face box (width * height)
  res.face.sort((a, b) => (b.box[2] * b.box[3]) - (a.box[2] * a.box[3]));
  
  return res.face[0].embedding;
};

/**
 * Fast initialization for mobile live tracking (optimized for 1 face).
 */
export const initializeLiveFaceApi = async () => {
  if (liveHuman) return;
  if (liveInitPromise) return liveInitPromise;

  liveInitPromise = (async () => {
    try {
      // Clone config but optimize for single face speed
      const liveConfig = JSON.parse(JSON.stringify(config));
      liveConfig.face.detector.maxDetected = 1;
      
      const h = new Human(liveConfig);
      await h.load();
      liveHuman = h;
      console.log('Live Human AI initialized successfully.');
    } catch (error) {
      liveInitPromise = null;
      console.error('Error initializing Live Human AI:', error);
      throw error;
    }
  })();

  return liveInitPromise;
};

/**
 * Rapid live detection returning the bounding box of the largest face.
 * Returns { box: { x, y, width, height } }
 */
export const detectLiveFaceBox = async (videoElement) => {
  if (!liveHuman) await initializeLiveFaceApi();

  const res = await liveHuman.detect(videoElement);
  if (!res || !res.face || res.face.length === 0) return null;

  res.face.sort((a, b) => (b.box[2] * b.box[3]) - (a.box[2] * a.box[3]));
  const face = res.face[0];
  
  // face.box in Human is [x, y, width, height]
  return {
    box: {
      x: face.box[0],
      y: face.box[1],
      width: face.box[2],
      height: face.box[3]
    },
    score: face.score || face.boxScore || 0,
    videoWidth: videoElement.videoWidth || videoElement.width,
    videoHeight: videoElement.videoHeight || videoElement.height
  };
};
