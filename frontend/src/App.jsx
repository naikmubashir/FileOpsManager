import React, { useState, useEffect } from "react";
// import {
//   getAllFiles,
//   uploadFile,
//   downloadFile,
//   deleteFile,
//   updateTags,
//   savePdfFromUrl,
// } from "./services/api";
import "./App.css";
import UploadModal from './UploadModal';

// import axios from 'axios'

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalFilesCount, setTotalFilesCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");

  // Fetch files on component mount and when search changes
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
        // Perform the signup request
       


        const res = await fetch('http://localhost:9000/api/files/', {
          method: "GET",
        });
        if (!res.ok) {
            console.log("Error", data.error, "error");
            return;
        }
        const data = await res.json();

        setTotalFilesCount(data.totalFilesCount);
         setFiles(data.files)
        console.log("Response Data:", typeof totalFilesCount,  files);

        // Handle error response from the API

        // Successfully signed up, store user data in localStorage and update state


    } catch (err) {
        // Handle unexpected errors
        console.error("An error occurred:", err);

        // Handle axios-specific error structure (e.g., network error or server error)
        const errorMessage = err.response?.data?.error || err.message || "Something went wrong!";
    }finally{
        setLoading(false);
    }
};
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this file?')) return;

  try {
    const res = await fetch(`http://localhost:9000/api/files/delete/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete');

    // Update UI by filtering out the deleted file
    setFiles(prevFiles => prevFiles.filter(file => file._id !== id));
    setTotalFilesCount(prevCount => prevCount - 1);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};


  const handleDownload = (fileId) => {
    const link = document.createElement('a');
    link.href = `/api/files/download/${fileId}`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return(<>
    <h1>HElloooo</h1>

    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ padding: '10px 20px', marginBottom: '20px' }}
      >
        Upload File
      </button>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      
    </div>
    <h4>Total Files: {totalFilesCount}</h4>
    <div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr >
            <th >Filename</th>
            <th >Content Type</th>
            <th >Upload Date</th>
            <th >Tags</th>
            <th >Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file._id}>
              <td >{file.filename}</td>
              <td >{file.contentType}</td>
              <td >{new Date(file.uploadDate).toLocaleString()}</td>
              <td >
                {file.metadata?.tags?.length > 0
                  ? file.metadata.tags.join(', ')
                  : 'No tags'}
              </td>
              <td >
              <button
    onClick={() => handleDownload(file._id)}
    style={{
      marginRight: '10px',
      padding: '6px 10px',
      backgroundColor: '#3498db',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
  >
    Download
  </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
  )
}

export default App;
