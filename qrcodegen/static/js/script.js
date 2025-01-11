document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const labelInput = document.getElementById('label');
    const fileTypeSelect = document.getElementById('fileType');
    const previewImage = document.getElementById('qrPreview');
    const generateBtn = document.getElementById('generateBtn');

    if (!urlInput || !labelInput || !fileTypeSelect || !previewImage || !generateBtn) {
        console.error('One or more required elements are missing in the HTML.');
        return;
    }

    const sanitizeFilename = (name) => name.trim().replace(/[^a-zA-Z0-9-_]/g, '_');

    const updatePreview = () => {
        const url = urlInput.value;
        const label = labelInput.value;
        const fileType = fileTypeSelect.value;

        if (url) {
            const timestamp = new Date().getTime();
            previewImage.src = `/preview?url=${encodeURIComponent(url)}&label=${encodeURIComponent(label)}&fileType=${fileType}&_=${timestamp}`;
            previewImage.classList.remove('hidden');
        } else {
            previewImage.src = '';
            previewImage.classList.add('hidden');
        }
    };

    urlInput.addEventListener('input', updatePreview);
    labelInput.addEventListener('input', updatePreview);
    fileTypeSelect.addEventListener('change', updatePreview);

    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled) return;
        generateBtn.disabled = true;

        const url = urlInput.value;
        const label = sanitizeFilename(labelInput.value);
        const fileType = fileTypeSelect.value;

        if (!url) {
            alert('Please enter a URL.');
            generateBtn.disabled = false;
            return;
        }

        console.log(`URL: ${url}, Label: ${label}, FileType: ${fileType}`); // Debugging log

        try {
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

                const downloadName = label || 'qr_code';
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${downloadName}.${fileType}`;
                console.log(`Downloading file: ${a.download}`); // Debugging log
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                const errorText = await response.text();
                console.error('Failed to generate QR code:', errorText);
                alert('Failed to generate QR code: ' + errorText);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code. Please try again.');
        } finally {
            generateBtn.disabled = false;
        }
    });
});
