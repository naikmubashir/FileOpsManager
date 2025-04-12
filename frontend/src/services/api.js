// import axios from "axios";

// const API_BASE_URL = "http://localhost:5000/api/files";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Upload file
// export const uploadFile = async (file, tags) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   if (tags) formData.append("tags", tags);

//   const response = await api.post("/upload", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return response.data;
// };

// // Get all files with optional filters
// export const getAllFiles = async (params = {}) => {
//   const response = await api.get("/", { params });
//   return response.data;
// };


// // Download a file
// export const downloadFile = async (fileId) => {
//   const response = await api.get(`/download/${fileId}`, {
//     responseType: "blob",
//   });
//   return response.data;
// };

// // Get file by ID
// export const getFileById = async (fileId) => {
//   const response = await api.get(`/${fileId}`);
//   return response.data;
// };

// // Update file tags
// export const updateTags = async (fileId, tags) => {
//   const response = await api.put(`/tags/${fileId}`, { tags });
//   return response.data;
// };

// // Delete file
// export const deleteFile = async (fileId) => {
//   const response = await api.delete(`/delete/${fileId}`);
//   return response.data;
// };

// // Save PDF from URL
// export const savePdfFromUrl = async (data) => {
//   const response = await api.post("/save-pdf-from-url", data);
//   return response.data;
// };

// export default api;
