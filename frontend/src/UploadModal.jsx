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
          body: JSON.stringify({ url: pdfUrl, filename: customName+'.pdf' }),
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
        <h2>Upload File</h2>
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
          <div>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
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

        <div style={{ marginTop: '20px' }}>
          <button onClick={handleUpload} style={uploadBtn}>Upload</button>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const modalOverlay = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  };
  
  const modalContent = {
    backgroundColor: '#fff', padding: '30px', borderRadius: '8px',
    width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };
  
  const tabContainer = { display: 'flex', marginBottom: '15px' };
  
  const tabActive = {
    flex: 1, padding: '10px', backgroundColor: '#3498db',
    color: 'white', border: 'none', cursor: 'pointer'
  };
  
  const tabInactive = {
    flex: 1, padding: '10px', backgroundColor: '#eee',
    color: '#333', border: 'none', cursor: 'pointer'
  };
  
  const inputStyle = {
    width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'
  };
  
  const uploadBtn = {
    padding: '8px 16px', backgroundColor: '#2ecc71',
    color: '#fff', border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'
  };
  
  const cancelBtn = {
    padding: '8px 16px', backgroundColor: '#e74c3c',
    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
  };
  
export default UploadModal;