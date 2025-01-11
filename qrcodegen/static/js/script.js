document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const labelInput = document.getElementById('label');
    const fileTypeSelect = document.getElementById('fileType');
    const previewImage = document.getElementById('qrPreview');
    const generateBtn = document.getElementById('generateBtn');

    const updatePreview = () => {
        const url = urlInput.value;
        const label = labelInput.value;
        const fileType = fileTypeSelect.value;
        console.log(`Preview - URL: ${url}, Label: ${label}, FileType: ${fileType}`);  // Add logging
        if (url) {
            previewImage.src = `/preview?url=${encodeURIComponent(url)}&label=${encodeURIComponent(label)}&fileType=${fileType}`;
            previewImage.classList.remove('hidden');
        } else {
            previewImage.src = '';
            previewImage.classList.add('hidden');
        }
    };

    urlInput.addEventListener('input', updatePreview);
    labelInput.addEventListener('input', updatePreview);

    generateBtn.addEventListener('click', async () => {
        const url = urlInput.value;
        const label = labelInput.value;
        const fileType = fileTypeSelect.value;
        console.log(`Generate - URL: ${url}, Label: ${label}, FileType: ${fileType}`);  // Add logging

        if (!url) {
            alert('Please enter a URL.');
            return;
        }

        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, label, fileType }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${label || 'qr_code'}.${fileType}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to generate QR code. Please try again.');
        }
    });
});