# 🚀 StoreIt - Modern File Storage

StoreIt is a sleek, modern, and secure file storage application built with the latest web technologies. It provides a seamless user experience for uploading, managing, and sharing files, powered by Appwrite's robust backend services.

---

## 🌐 Live Demo

You can view a live demo of the project deployed on Vercel here:

**[➡️ Live Demo Link](https://store-it-mu-inky.vercel.app/)**

---

## ✨ Features

- **✨ Secure Passwordless Auth:** Sign up or log in using only your email. A one-time password (OTP) is sent to your inbox for secure, password-free access.
- **📊 Storage Dashboard:** A visual radial chart shows your total storage used (out of the 2GB limit).
- **🗂️ By-Type Summary:** The dashboard categorizes your files (Documents, Images, Media, Others) and shows the total size and most recent upload for each category.
- **📤 Drag-and-Drop Upload:** A modern `react-dropzone` uploader with file previews, a 50MB file size limit, and toast notifications (`sonner`) for upload status.
- **🔍 Real-time Search:** A debounced search bar to instantly find files by name across your entire library.
- **📂 Categorized Views:** Browse files in dedicated, dynamic pages for `/documents`, `/images`, `/media`, and `/others`/page.tsx`].
- **↕️ File Sorting:** Sort any file view by name (A-Z, Z-A), date created (newest, oldest), or size (highest, lowest).
- **⚡ File Actions:** Perform actions on each file via a dropdown menu:
    - **✍️ Rename:** Update the name of your files.
    - **🗑️ Delete:** Securely remove files from storage and the database.
    - **📥 Download:** Download the original file directly to your device.
    - **ℹ️ View Details:** A modal showing file format, size, owner, and modification date.
    - **🚀 Share (Upcoming)** 

---

## 🛠️ Tech Stack

This project is built with a modern, type-safe, and efficient stack:

- **Frontend:**
    - **Next.js (App Router)** - React framework for server-side rendering and Server Actions.
    - **React** - A JavaScript library for building user interfaces.
    - **TypeScript** - A typed superset of JavaScript.
- **Backend (BaaS):**
    - **Appwrite** - Open-source Backend-as-a-Service for web and mobile apps. Used for:
        - **Authentication:** Passwordless Email OTP (Magic Link).
        - **Database:** Storing file metadata, user info, and relationships.
        - **Storage:** Storing the actual uploaded files in buckets.
- **Styling & UI:**
    - **Tailwind CSS** - A utility-first CSS framework for rapid UI development.
    - **shadcn/ui** - Re-usable components built using Radix UI and Tailwind CSS.
    - **Lucide React** - Beautiful and consistent icons.
    - **Recharts** - For the storage usage chart.
    - **Sonner** - For toast notifications.
    - **React Dropzone** - For drag-and-drop file uploads.
- **Deployment:**
    - **Vercel** - Optimized for deploying Next.js applications.

### 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
