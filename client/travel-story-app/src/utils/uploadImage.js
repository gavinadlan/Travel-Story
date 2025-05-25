import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  // Append image file to form data
  formData.append("image", imageFile);

  try {
    console.log("Uploading image:", imageFile.name);
    console.log("Image file details:", {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
    });

    const response = await axiosInstance.post("/image-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set header for file upload
      },
    });

    console.log("Image upload response:", response.data);
    return response.data; // Return response data
  } catch (error) {
    console.error(
      "Error uploading the image:",
      error.response?.data || error.message
    );
    throw error; // Rethrow error for handling
  }
};

export default uploadImage;
