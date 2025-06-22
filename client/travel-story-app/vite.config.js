import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// vite.config.js
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {
      CLOUDINARY_CLOUD_NAME: JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
      CLOUDINARY_API_KEY: JSON.stringify(process.env.CLOUDINARY_API_KEY),
    },
  },
});
