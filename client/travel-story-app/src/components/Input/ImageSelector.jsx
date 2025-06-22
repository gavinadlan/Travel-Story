import React, { useRef, useEffect } from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector = ({ image, setImage, handleDeleteImg }) => {
  const inputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  // Tampilkan preview gambar
  const getImageUrl = () => {
    if (typeof image === "string") {
      return image; // URL dari Cloudinary
    } else if (image) {
      return URL.createObjectURL(image); // File lokal
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="flex flex-col gap-2">
      <label className="input-label">STORY IMAGE</label>

      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Story"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            type="button"
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            onClick={handleDeleteImg}
          >
            <MdDeleteOutline className="text-xl" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 text-slate-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-slate-400">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-slate-400">PNG, JPG (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept="image/*"
            ref={inputRef}
          />
        </label>
      )}
    </div>
  );
};

export default ImageSelector;
