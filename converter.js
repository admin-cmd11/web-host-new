const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const messageDiv = document.getElementById('message');
const loader = document.getElementById('loadingWheel');
const backendURL = 'https://txt2excelbackend.onrender.com/process-file'; // Your backend

function updateFileName() {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
  } else {
    fileName.textContent = 'No file chosen';
  }
}

fileInput.addEventListener('change', updateFileName);

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    updateFileName();
  }
});

async function uploadFile() {
  const file = fileInput.files[0];

  if (!file) {
    messageDiv.textContent = 'Please select a .txt file.';
    return;
  }

  loader.style.display = 'block';
  messageDiv.textContent = 'Uploading and processing...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(backendURL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cbse_results.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      messageDiv.textContent = 'Excel file downloaded successfully!';
    } else {
      const errorText = await response.text();
      messageDiv.textContent = `Error processing file: ${errorText}`;
    }
  } catch (error) {
    messageDiv.textContent = `Network error: ${error.message}`;
  } finally {
    loader.style.display = 'none';
  }
}
