import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@capacitor-community/media';
import { saveAs } from 'file-saver';

/**
 * Saves a single Blob natively via Capacitor Media directly into the iOS/Android Photo Library Gallery,
 * plus presents Share Sheet when requested, or falls back to file-saver saveAs on web browsers.
 */
export async function saveFileHelper(blob, filename, dialogTitle = 'Save File') {
  if (Capacitor.isNativePlatform()) {
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 1. Save directly into native iOS/Android Photo Album Gallery (Camera Roll)
      try {
        await Media.savePhoto({ path: dataUrl });
      } catch (mediaErr) {
        console.warn('Direct savePhoto to Gallery error, falling back to Filesystem:', mediaErr);
      }

      // 2. Write to Filesystem cache and present Share Sheet
      const base64Data = dataUrl.split(',')[1];
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache
      });

      try {
        await Share.share({
          title: dialogTitle,
          url: savedFile.uri,
          dialogTitle: dialogTitle
        });
      } catch (shareErr) {
        // Share sheet dismissed or unavailable
      }
      return true;
    } catch (err) {
      console.error('Native save error:', err);
      saveAs(blob, filename);
      return false;
    }
  } else {
    saveAs(blob, filename);
    return true;
  }
}

/**
 * Saves multiple image Blobs directly to the iOS/Android Photo Gallery (Camera Roll) natively,
 * plus writes them to Cache directory for sharing.
 */
export async function saveMultipleFilesHelper(blobItems, batchTitle = 'Yogi Studio Memories') {
  if (Capacitor.isNativePlatform()) {
    try {
      const fileUris = [];
      for (const item of blobItems) {
        const { blob, filename } = item;
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // 1. Save directly into native iOS/Android Photo Album Gallery (Camera Roll)
        try {
          await Media.savePhoto({ path: dataUrl });
        } catch (mediaErr) {
          console.warn('Direct savePhoto for item failed:', mediaErr);
        }

        // 2. Also save to cache for share sheet or file access
        const base64Data = dataUrl.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });
        fileUris.push(savedFile.uri);
      }

      // Optionally offer the native share sheet if they also want to AirDrop/Share directly
      if (fileUris.length > 0) {
        try {
          await Share.share({
            title: batchTitle,
            files: fileUris,
            dialogTitle: batchTitle
          });
        } catch (shareErr) {
          // User dismissed share sheet or silent completion
        }
      }
      return true;
    } catch (err) {
      console.error('Native batch save error:', err);
      for (const item of blobItems) {
        saveAs(item.blob, item.filename);
      }
      return false;
    }
  } else {
    for (const item of blobItems) {
      saveAs(item.blob, item.filename);
      await new Promise(r => setTimeout(r, 300));
    }
    return true;
  }
}
