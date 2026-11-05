/**
 * frontend/src/utils/imageCompressor.js
 * Utilitas kompresi gambar tangkapan layar (screenshot) pertandingan:
 * - Mengubah resolusi gambar HP (yang seringkali 3-5 MB) menjadi resolusi efisien (maks 1280px).
 * - Mengompres kualitas ke JPEG 0.75 (~70 - 150 KB).
 * - Menghindari beban payload Supabase & browser rendering lag.
 */

export const compressImageFile = (file, maxWidth = 1280, maxHeight = 720, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("File bukan gambar yang valid"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek untuk mempertahankan skala
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target.result); // Fallback ke original dataURL
          return;
        }

        // Gambar ke canvas dengan smoothing berkualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG dengan kualitas terkompresi
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

