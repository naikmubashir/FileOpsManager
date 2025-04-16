import { useState } from 'react';

const UploadModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [customName, setCustomName] = useState('');

  const handleUpload = async () => {
    if (activeTab === 'file') {
      if (!selectedFile) return alert("Please select a file");

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await fetch('http://localhost:9000/api/files/upload/', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        alert('File uploaded!');
        onClose();
      } catch (err) {
        console.error(err);
        alert('Upload error');
      }
    } else {
      if (!pdfUrl || !customName) return alert("Enter both PDF URL and name");

      try {
        const res = await fetch('http://localhost:9000/api/files/save-pdf-from-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pdfUrl, filename: customName + '.pdf' }),
        });

        if (!res.ok) throw new Error('Upload from URL failed');
        alert('PDF uploaded from URL!');
        onClose();
      } catch (err) {
        console.error(err);
        alert('Upload error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h2 style={modalTitle}>Upload File</h2>
        <div style={tabContainer}>
          <button
            style={activeTab === 'file' ? tabActive : tabInactive}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
          <button
            style={activeTab === 'url' ? tabActive : tabInactive}
            onClick={() => setActiveTab('url')}
          >
            Paste PDF URL
          </button>
        </div>

        {activeTab === 'file' ? (
          <div style={fileUploadContainer}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={fileInputStyle}
            />
          </div>
        ) : (
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="PDF URL"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="File name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{ ...inputStyle, marginTop: '8px' }}
            />
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleUpload} style={uploadBtn}>
            Upload
          </button>
          <button onClick={onClose} style={cancelBtn}>
            Cancel</button>
        </div>
      </div>
    </div>
  );
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '12px',
  width: '400px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  animation: 'fadeIn 0.3s ease-in-out',
};

const modalTitle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center',
  color: '#333',
};

const tabContainer = {
  display: 'flex',
  marginBottom: '15px',
  borderBottom: '2px solid #ddd',
};

const tabActive = {
  flex: 1,
  padding: '10px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '8px 8px 0 0',
  fontWeight: 'bold',
};

const tabInactive = {
  flex: 1,
  padding: '10px',
  backgroundColor: '#f5f5f5',
  color: '#333',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '8px 8px 0 0',
};

const fileUploadContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100px',
  border: '2px dashed #ccc',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

const fileInputStyle = {
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
};

const uploadBtn = {
  padding: '10px 20px',
  backgroundColor: '#2ecc71',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const cancelBtn = {
  padding: '10px 20px',
  backgroundColor: '#e74c3c',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
};

export default UploadModal;