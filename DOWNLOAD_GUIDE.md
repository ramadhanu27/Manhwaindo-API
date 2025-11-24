# Manhwaindo API - Download Guide

## 📥 Client-Side Download Implementation

### Why Client-Side?

Netlify Functions memiliki limit **6MB** untuk response payload. Untuk download PDF/ZIP yang besar, kita menggunakan **client-side processing** di frontend.

### Benefits:

- ✅ No file size limit
- ✅ No server load
- ✅ Faster processing (parallel downloads)
- ✅ Works with serverless functions
- ✅ Easy progress tracking

---

## 🎯 Implementation

### Step 1: Get Chapter Images

Use the `/api/chapter/:slug` endpoint to get image URLs:

```javascript
async function getChapterImages(slug) {
  const response = await fetch(`https://apimanhwa.netlify.app/api/chapter/${slug}`);
  const data = await response.json();

  if (data.success) {
    return data.data.images; // Array of image URLs
  }

  throw new Error(data.message);
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "title": "The Solo Leveling ID Chapter 00",
    "slug": "the-solo-leveling-id-chapter-00",
    "images": ["https://img-id.gmbr.pro/uploads/.../1.jpg", "https://img-id.gmbr.pro/uploads/.../2.jpg", "https://img-id.gmbr.pro/uploads/.../3.jpg"],
    "prevChapter": null,
    "nextChapter": "the-solo-leveling-id-chapter-01",
    "totalImages": 10
  }
}
```

---

### Step 2: Download as PDF (Single Page)

**Include jsPDF:**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

**Implementation:**

```javascript
async function downloadChapterAsPDF(slug) {
  // 1. Get images
  const images = await getChapterImages(slug);

  // 2. Download all images
  const imageBlobs = [];
  for (const imageUrl of images) {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    imageBlobs.push(blob);
  }

  // 3. Create PDF
  const { jsPDF } = window.jspdf;
  const pageWidth = 595; // A4 width
  let totalHeight = 0;
  const imageDataList = [];

  // Convert blobs to data URLs
  for (const blob of imageBlobs) {
    const dataUrl = await blobToDataURL(blob);
    const img = await loadImage(dataUrl);
    const scaledHeight = (img.height * pageWidth) / img.width;
    imageDataList.push({ dataUrl, width: pageWidth, height: scaledHeight });
    totalHeight += scaledHeight;
  }

  // Create single page PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageWidth, totalHeight],
  });

  // Add all images vertically
  let yPosition = 0;
  for (const imgData of imageDataList) {
    pdf.addImage(imgData.dataUrl, "JPEG", 0, yPosition, imgData.width, imgData.height);
    yPosition += imgData.height;
  }

  // 4. Save PDF
  pdf.save(`${slug}.pdf`);
}

// Helper functions
function blobToDataURL(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}
```

---

### Step 3: Download as ZIP

**Include JSZip:**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

**Implementation:**

```javascript
async function downloadChapterAsZIP(slug) {
  // 1. Get images
  const images = await getChapterImages(slug);

  // 2. Create ZIP
  const zip = new JSZip();

  // 3. Download and add images
  for (let i = 0; i < images.length; i++) {
    const res = await fetch(images[i]);
    const blob = await res.blob();
    const ext = images[i].match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || "jpg";
    const filename = `${String(i + 1).padStart(3, "0")}.${ext}`;
    zip.file(filename, blob);
  }

  // 4. Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

### Step 4: Download Multiple Chapters

```javascript
async function downloadMultipleChaptersAsZIP(slugs) {
  const zip = new JSZip();

  for (const slug of slugs) {
    // Get chapter images
    const images = await getChapterImages(slug);

    // Create folder for this chapter
    const folder = zip.folder(slug);

    // Download and add images
    for (let i = 0; i < images.length; i++) {
      const res = await fetch(images[i]);
      const blob = await res.blob();
      const ext = images[i].match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || "jpg";
      const filename = `${String(i + 1).padStart(3, "0")}.${ext}`;
      folder.file(filename, blob);
    }
  }

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chapters-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// Usage
downloadMultipleChaptersAsZIP(["the-solo-leveling-id-chapter-00", "the-solo-leveling-id-chapter-01", "the-solo-leveling-id-chapter-02"]);
```

---

## 🎨 With Progress Bar

```javascript
async function downloadWithProgress(slug) {
  const images = await getChapterImages(slug);
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const res = await fetch(images[i]);
    const blob = await res.blob();

    // Update progress
    const percent = ((i + 1) / total) * 100;
    updateProgress(percent, `Downloading ${i + 1}/${total}...`);
  }
}

function updateProgress(percent, text) {
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").textContent = text;
}
```

---

## 📱 Live Demo

Lihat demo lengkap dengan UI:

- Local: `http://localhost:3000/download-demo.html`
- Production: `https://apimanhwa.netlify.app/download-demo.html`

---

## ⚠️ Notes

- Download dilakukan di browser user (client-side)
- Tidak ada batasan ukuran file dari server
- Memerlukan koneksi internet yang stabil
- Browser harus support modern JavaScript (async/await)
- CORS sudah enabled di API

---

## 🔗 API Endpoint

**Get Chapter Images:**

```
GET https://apimanhwa.netlify.app/api/chapter/:slug
```

**Example:**

```
GET https://apimanhwa.netlify.app/api/chapter/the-solo-leveling-id-chapter-00
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "The Solo Leveling ID Chapter 00",
    "slug": "the-solo-leveling-id-chapter-00",
    "images": ["url1", "url2", "url3"],
    "totalImages": 10
  }
}
```
