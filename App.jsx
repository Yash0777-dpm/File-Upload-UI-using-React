// App.jsx
import React, { useState, useRef } from 'react';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const allowedExtensions = ['csv', 'xls', 'xlsx'];

  const isValidCSV = (content) => {
    const lines = content.trim().split(/\r?\n/);
    if (lines.length === 0) return false;
    const firstLineCells = lines[0].split(',');
    return firstLineCells.length > 1;
  };

  const checkExcelMagicNumbers = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const arr = new Uint8Array(e.target.result);
        if (arr.length < 4) {
          resolve(false);
          return;
        }
        if (arr[0] === 0x50 && arr[1] === 0x4B) {
          resolve(true); // XLSX
          return;
        }
        if (arr[0] === 0xD0 && arr[1] === 0xCF && arr[2] === 0x11 && arr[3] === 0xE0) {
          resolve(true); // XLS
          return;
        }
        resolve(false);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const handleFileChange = async (e) => {
    setFileError('');
    setFile(null);
    setUploadProgress(0);

    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setFileError('Invalid file type. Please select a CSV or Excel file.');
      return;
    }

    try {
      if (ext === 'csv') {
        const text = await selectedFile.text();
        if (!isValidCSV(text)) {
          setFileError('Invalid CSV format. The first line should have at least 2 comma-separated values.');
          return;
        }
      } else {
        const validExcel = await checkExcelMagicNumbers(selectedFile);
        if (!validExcel) {
          setFileError('Invalid Excel file format.');
          return;
        }
      }
      setFile(selectedFile);
    } catch (error) {
      setFileError('Error reading file. Please try again.');
    }
  };

  const simulateUpload = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(progress);
          resolve();
        } else {
          setUploadProgress(progress);
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError('Please select a file before uploading.');
      return;
    }
    setFileError('');
    setUploadProgress(0);
    try {
      await simulateUpload();
      alert(`Upload complete: ${file.name}`);
      setFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setFileError('Error occurred during upload.');
    }
  };

  // Just a few tweaks in your JSX for classNames & structure

return (
  <div className="upload-container">
    <h1>Select Files*</h1>
    <p>Allowed only CSV and Excel files (.csv, .xls, .xlsx)</p>
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv,.xls,.xlsx"
      onChange={handleFileChange}
    />
    {file && <div className="info">Selected file: {file.name}</div>}
    {fileError && <div className="error">{fileError}</div>}

    <button
      onClick={handleUpload}
      disabled={!file}
      className="upload-button"
    >
      Upload
    </button>

    {uploadProgress > 0 && (
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${uploadProgress}%` }}
        >
          {uploadProgress}%
        </div>
      </div>
    )}
  </div>
);
};


export default App;