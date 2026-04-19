# Architecture

This document describes the architecture of the Meet Transcripts Chrome extension using the [C4 model](https://c4model.com/).

---

## Level 1 — System Context

Who uses the system and what external systems does it interact with.

```mermaid
C4Context
    title System Context — Meet Transcripts

    Person(user, "User", "Joins Google Meet calls and wants transcripts exported automatically")

    System(ext, "Meet Transcripts", "Chrome extension that captures live captions from Google Meet and exports transcripts as files or webhook payloads")

    System_Ext(gmeet, "Google Meet", "Web-based video conferencing at meet.google.com")
    System_Ext(webhook, "Webhook Endpoint", "User-configured HTTP endpoint (e.g. Zapier, Make, custom API)")

    Rel(user, ext, "Configures settings, views meeting history")
    Rel(ext, gmeet, "Observes live captions via DOM mutations")
    Rel(ext, webhook, "POSTs transcript payload on meeting end")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Level 2 — Container

The internal containers (deployable/runnable units) inside the extension.

```mermaid
C4Container
    title Container Diagram — Meet Transcripts Extension

    Person(user, "User", "Chrome browser user")

    Container_Boundary(ext, "Meet Transcripts Extension (MV3)") {
        Container(bg, "Background Service Worker", "background.js", "Central orchestrator: meeting lifecycle, webhook dispatch, file download, storage management")
        Container(cs, "Content Script", "content-google-meet.js", "Injected into meet.google.com — observes DOM caption mutations and extracts speaker + text chunks")
        Container(popup, "Popup UI", "popup.html / popup.js", "Mode toggle (auto / manual), link to meetings page")
        Container(meetings, "Meetings UI", "meetings.html / meetings.js", "Meeting history viewer and webhook configuration")
    }

    ContainerDb(sync, "chrome.storage.sync", "Chrome Storage API", "Persisted user settings: operationMode, webhookUrl, webhookBodyType, download/post flags")
    ContainerDb(local, "chrome.storage.local", "Chrome Storage API", "Ephemeral state: in-progress transcript buffer, last 10 completed meetings")

    System_Ext(gmeet, "Google Meet", "meet.google.com")
    System_Ext(webhook, "Webhook Endpoint", "User-configured HTTP endpoint")

    Rel(user, popup, "Opens to toggle mode or navigate")
    Rel(user, meetings, "Views history, configures webhook")
    Rel(gmeet, cs, "Fires DOM MutationObserver events")
    Rel(cs, bg, "Sends transcript chunks", "chrome.runtime.sendMessage")
    Rel(bg, sync, "Reads / writes settings", "chrome.storage API")
    Rel(bg, local, "Reads / writes transcript data", "chrome.storage API")
    Rel(bg, webhook, "POSTs transcript on meeting end", "fetch / XMLHttpRequest")
    Rel(popup, bg, "Sends commands, receives status", "chrome.runtime messaging")
    Rel(meetings, bg, "Sends commands, receives history", "chrome.runtime messaging")
    Rel(popup, sync, "Reads current settings", "chrome.storage API")
    Rel(meetings, sync, "Reads settings and meeting history", "chrome.storage API")

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

---

## Level 3 — Component (Background Service Worker)

Internal components of the central orchestrator.

```mermaid
C4Component
    title Component Diagram — Background Service Worker (background.js)

    Container_Boundary(bg, "Background Service Worker") {
        Component(msgHandler, "Message Handler", "JS", "Entry point — routes incoming chrome.runtime messages from content script and UI containers")
        Component(lifecycle, "Meeting Lifecycle Manager", "JS", "Tracks meeting start and end via tab events and content-script signals; coordinates output on meeting end")
        Component(storeMgr, "Storage Manager", "JS", "Abstracts all chrome.storage.sync and .local reads and writes")
        Component(webhookDisp, "Webhook Dispatcher", "JS", "Builds JSON payload and POSTs to the configured webhook URL")
        Component(fileDown, "File Downloader", "JS", "Triggers browser download of the transcript as a .txt file via chrome.downloads")
    }

    Container(cs, "Content Script", "content-google-meet.js", "Caption capture")
    Container(popup, "Popup UI", "popup.html/js", "Mode toggle")
    Container(meetings, "Meetings UI", "meetings.html/js", "History & config")
    ContainerDb(sync, "chrome.storage.sync", "Chrome Storage API", "Settings")
    ContainerDb(local, "chrome.storage.local", "Chrome Storage API", "Transcript data")
    System_Ext(webhookEp, "Webhook Endpoint", "External HTTP endpoint")

    Rel(cs, msgHandler, "Transcript chunk", "chrome.runtime.sendMessage")
    Rel(popup, msgHandler, "Commands / queries", "chrome.runtime.sendMessage")
    Rel(meetings, msgHandler, "Commands / queries", "chrome.runtime.sendMessage")

    Rel(msgHandler, lifecycle, "Delegates meeting events")
    Rel(msgHandler, storeMgr, "Delegates storage queries from UI")

    Rel(lifecycle, storeMgr, "Append chunk / read full transcript / clear buffer")
    Rel(lifecycle, webhookDisp, "Triggers on meeting end (if enabled)")
    Rel(lifecycle, fileDown, "Triggers on meeting end (if enabled)")

    Rel(storeMgr, sync, "Read / write")
    Rel(storeMgr, local, "Read / write")
    Rel(webhookDisp, webhookEp, "HTTP POST")

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

---

## Data flow — transcript capture to output

```mermaid
sequenceDiagram
    participant Meet as Google Meet (DOM)
    participant CS as Content Script
    participant BG as Background Worker
    participant Store as chrome.storage.local
    participant Out as Output

    Meet->>CS: Caption element mutation
    CS->>CS: Parse speaker + text
    CS->>BG: chrome.runtime.sendMessage(chunk)
    BG->>Store: Append chunk to in-progress transcript

    Note over Meet,Out: Meeting ends (tab close / leave)

    BG->>Store: Read full transcript
    BG->>Out: Download as .txt file
    BG->>Out: POST to webhook URL (if configured)
    BG->>Store: Write to last-10-meetings list
    BG->>Store: Clear in-progress transcript
```

---

## Storage model

```mermaid
erDiagram
    SYNC_STORAGE {
        string operationMode "auto | manual"
        bool autoDownloadFileAfterMeeting
        bool autoPostWebhookAfterMeeting
        string webhookUrl
        string webhookBodyType "simple | advanced"
    }

    LOCAL_STORAGE {
        string inProgressTranscript "Active meeting buffer"
        array meetings "Last 10 completed meetings"
    }

    MEETING {
        string title
        string platform "Google Meet"
        string timestamp
        string transcript
    }

    LOCAL_STORAGE ||--o{ MEETING : "stores up to 10"
```

---

## Key files reference

| File | Role |
|------|------|
| `extension/manifest.json` | Extension metadata, permissions, host matches |
| `extension/background.js` | Service worker — central orchestrator |
| `extension/content-google-meet.js` | Google Meet DOM observer and transcript capture |
| `extension/popup.html/js` | Extension popup UI |
| `extension/meetings.html/js` | Meeting history and webhook configuration UI |
| `types/index.js` | JSDoc type definitions |
| `docs/decisions/` | Architecture decision records |
