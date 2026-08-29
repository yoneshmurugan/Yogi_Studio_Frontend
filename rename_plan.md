# Event Renaming Architecture Plan

## Objective
Currently, renaming an event breaks the shareable link and the printed QR code because the system relies on the event's name as the unique identifier in the URL and the database. 
This plan outlines the architectural changes required to decouple the **Display Name** from the **Unique ID**, allowing safe renaming without breaking existing QR codes or links.

## 1. Database (Firebase Firestore) Architecture
### Current State
- Document ID: Matches the event name (e.g., `Our-Family`).
- When renamed, a new document is often created, or the system tries to change the ID, which breaks references.

### Proposed State
- **Document ID**: A randomly generated, permanent string (e.g., `evt_12345ABC`).
- **Fields**:
  - `id`: (String) `evt_12345ABC`
  - `name`: (String) `Our Family` (This is the display name)
  - `createdAt`: (Timestamp)
  - `photos`: (Array of URLs)

**Renaming Action**: 
When an admin renames an event in the dashboard, the system only updates the `name` field in Firestore. The Document ID (`evt_12345ABC`) never changes.

## 2. Storage (Firebase Storage) Architecture
### Current State
- Photos are uploaded to a folder named after the event (e.g., `events/Our-Family/`).
- If the event is renamed, the folder name no longer matches, breaking image paths.

### Proposed State
- Photos are uploaded to a folder named after the permanent Document ID (e.g., `events/evt_12345ABC/`).
- Because the folder is tied to the ID and not the Name, the folder never needs to be renamed.

## 3. Frontend Routing & QR Codes
### Routing Update
- Change the client-side route from `/photos/:eventName` to `/photos/:eventId`.
- Example URL: `https://yogidigitalstudio.in/photos/evt_12345ABC`

### UI Rendering
- When a user visits `/photos/evt_12345ABC`, the frontend queries Firestore for the document with ID `evt_12345ABC`.
- The frontend reads the `name` field (e.g., "Our Family") and displays it in the header.

### QR Code Generation
- The QR Code generator will now encode the URL using the `eventId` instead of the `eventName`.
- Because the `eventId` is permanent, the QR code will never break, even if the `name` changes 100 times.

## 4. Migration Plan (Handling Existing Events)
If you already have events in the database that you want to keep:
1. **Database Migration**: Write a one-time script that loops through all existing events. For each event, generate a new random ID, copy the data into a new document under that ID, and add `name: [Old Document ID]`.
2. **Storage Migration**: You can either move the photos in Firebase Storage to the new ID-based folders, or add a `legacyFolderPath` field to the database so the frontend knows to look in the old folder for old events.
