import axiosInstance from "./axiosInstance";

/**
 * Mengupload gambar ke Cloudinary via backend
 * @param {File} file - File gambar yang akan diupload
 * @returns {Promise<{imageUrl: string}>} Objek berisi URL gambar
 */
export const uploadImage = async (file) => {
  try {
    // Membaca file sebagai base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
        const result = reader.result;
        // Ekstrak bagian base64 setelah comma
        resolve(result.split(",")[1]);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });

    // Mengirim ke backend
    const response = await axiosInstance.post("/upload-image", {
      image: base64Data,
    });

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);

    // Format error untuk ditampilkan di UI
    const errorMessage =
      error.response?.data?.message || error.message || "Image upload failed";

    throw new Error(errorMessage);
  }
};
