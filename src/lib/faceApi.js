import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceapi from 'face-api.js';

let isInitialized = false;

/**
 * Initializes the TensorFlow backend and loads the required models.
 * We load ssdMobilenetv1 for Admin processing (higher accuracy)
 * and tinyFaceDetector for attendee selfies (faster, lighter).
 */
export const initializeFaceApi = async () => {
  if (isInitialized) return;

  try {
    // 1. Force WebGL backend for GPU acceleration
    await tf.setBackend('webgl');
    await tf.ready();

    const MODEL_URL = '/models';

    // 2. Load the models
    // High accuracy detection (Admin)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    // Fast detection (Attendee)
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    // Landmark and Recognition nets are required for descriptor extraction
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    isInitialized = true;
    console.log('FaceAPI initialized successfully with WebGL backend.');
  } catch (error) {
    console.error('Error initializing FaceAPI:', error);
    throw error;
  }
};

/**
 * Extracts 128-d face descriptors for all faces found in an image element.
 * Useful for the Admin batch processing.
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} input 
 * @returns {Promise<Float32Array[]>} Array of 128-d face descriptors
 */
export const extractAllFaces = async (input) => {
  if (!isInitialized) await initializeFaceApi();

  // We use SsdMobilenetv1Options for highest accuracy on the Admin side
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
  
  const detections = await faceapi.detectAllFaces(input, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map(d => d.descriptor);
};

/**
 * Extracts a single 128-d face descriptor for the largest face found in an image.
 * Useful for the Attendee selfie capture.
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} input 
 * @returns {Promise<Float32Array | null>} The 128-d face descriptor or null if no face found
 */
export const extractSingleFace = async (input) => {
  if (!isInitialized) await initializeFaceApi();

  // We use TinyFaceDetectorOptions for fast client-side selfie processing
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

  const detection = await faceapi.detectSingleFace(input, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return detection.descriptor;
};
