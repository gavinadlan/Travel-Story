import React, { useState } from "react";
import { MdAdd, MdUpdate, MdClose } from "react-icons/md";
import DateSelector from "../../components/Input/DateSelector";
import ImageSelector from "../../components/Input/ImageSelector";
import TagInput from "../../components/Input/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import { toast } from "react-toastify";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  );
  const [visitedDate, setVisitedDate] = useState(
    storyInfo?.visitedDate ? new Date(storyInfo.visitedDate) : new Date()
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Fungsi untuk upload gambar ke server
  const uploadImage = async (file) => {
    setIsUploading(true);
    try {
      // Konversi file ke base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

      // Kirim sebagai JSON
      const response = await axiosInstance.post("/upload-image", {
        image: base64Data,
      });

      setIsUploading(false);
      return response.data;
    } catch (error) {
      setIsUploading(false);
      console.error("Upload failed:", error);
      throw new Error("Failed to upload image");
    }
  };

  // Add New Travel Story
  const addNewTravelStory = async () => {
    try {
      let imageUrl = storyImg;

      // Jika ada file baru, upload dulu
      if (
        storyImg &&
        typeof storyImg !== "string" &&
        storyImg instanceof File
      ) {
        const uploadResponse = await uploadImage(storyImg);
        imageUrl = uploadResponse.imageUrl;
      }

      const payload = {
        title,
        story,
        imageUrl,
        visitedLocation,
        visitedDate: visitedDate.getTime(),
      };

      const response = await axiosInstance.post("/add-travel-story", payload);

      if (response.data) {
        toast.success("Story Added Successfully");
        getAllTravelStories();
        onClose();
      }
    } catch (error) {
      console.error("Add story error:", error);
      setError(error.response?.data?.message || "Failed to add story");
    }
  };

  // Update Travel story
  const updateTravelStory = async () => {
    try {
      let imageUrl = storyImg;

      // Jika ada file baru, upload dulu
      if (
        storyImg &&
        typeof storyImg !== "string" &&
        storyImg instanceof File
      ) {
        const uploadResponse = await uploadImage(storyImg);
        imageUrl = uploadResponse.imageUrl;
      }

      const payload = {
        title,
        story,
        visitedLocation,
        visitedDate: visitedDate.getTime(),
        imageUrl,
      };

      const response = await axiosInstance.put(
        `/edit-story/${storyInfo._id}`,
        payload
      );

      if (response.data) {
        toast.success("Story Updated Successfully");
        getAllTravelStories();
        onClose();
      }
    } catch (error) {
      console.error("Update story error:", error);
      setError(error.response?.data?.message || "Failed to update story");
    }
  };

  const handleAddOrUpdateClick = () => {
    if (!title.trim()) {
      setError("Please enter the title");
      return;
    }

    if (!story.trim()) {
      setError("Please enter the story");
      return;
    }

    setError("");

    if (type === "edit") {
      updateTravelStory();
    } else {
      addNewTravelStory();
    }
  };

  // Fungsi hapus gambar
  const handleRemoveImage = () => {
    setStoryImg(null);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-medium text-slate-700">
          {type === "add" ? "Add Story" : "Update Story"}
        </h5>

        <div>
          <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
            {type === "add" ? (
              <button
                className="btn-small"
                onClick={handleAddOrUpdateClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <MdAdd className="text-lg" /> ADD STORY
                  </>
                )}
              </button>
            ) : (
              <button
                className="btn-small"
                onClick={handleAddOrUpdateClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <MdUpdate className="text-lg" /> UPDATE STORY
                  </>
                )}
              </button>
            )}

            <button className="" onClick={onClose} disabled={isUploading}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex-1 flex flex-col gap-2 pt-4">
          <label className="input-label">TITLE</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none"
            placeholder="A Day at the Great Wall"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <div className="my-3">
            <DateSelector date={visitedDate} setDate={setVisitedDate} />
          </div>

          <ImageSelector
            image={storyImg}
            setImage={setStoryImg}
            handleDeleteImg={handleRemoveImage}
            disabled={isUploading}
          />

          <div className="flex flex-col gap-2 mt-4">
            <label className="input-label">STORY</label>
            <textarea
              className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
              placeholder="Your Story"
              rows={10}
              value={story}
              onChange={({ target }) => setStory(target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="pt-3">
            <label className="input-label">VISITED LOCATIONS</label>
            <TagInput
              tags={visitedLocation}
              setTags={setVisitedLocation}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditTravelStory;
