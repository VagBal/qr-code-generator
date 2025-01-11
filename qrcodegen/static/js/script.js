document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const labelInput = document.getElementById('label');
    const fileTypeSelect = document.getElementById('fileType');
    const previewImage = document.getElementById('qrPreview');
    const generateBtn = document.getElementById('generateBtn');

    // Check if all required elements exist in the HTML
    if (!urlInput || !labelInput || !fileTypeSelect || !previewImage || !generateBtn) {
        console.error('One or more required elements are missing in the HTML.');
        return;
    }

    // Sanitize filename to avoid invalid characters
    const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Update the preview image
    const updatePreview = () => {
        const url = urlInput.value;
        const label = labelInput.value;
        const fileType = fileTypeSelect.value;

        if (url) {
            const timestamp = new Date().getTime(); // Prevent caching
            previewImage.src = `/preview?url=${encodeURIComponent(url)}&label=${encodeURIComponent(label)}&fileType=${fileType}&_=${timestamp}`;
            previewImage.classList.remove('hidden');
        } else {
            previewImage.src = '';
            previewImage.classList.add('hidden');
        }
    };

    // Attach event listeners for inputs
    urlInput.addEventListener('input', updatePreview);
    labelInput.addEventListener('input', updatePreview);
    fileTypeSelect.addEventListener('change', updatePreview);

    // Handle QR code generation and download
    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled) return; // Prevent duplicate clicks
        generateBtn.disabled = true; // Disable the button during processing

        const url = urlInput.value;
        const label = sanitizeFilename(labelInput.value) || 'qr_code';
        const fileType = fileTypeSelect.value;

        if (!url) {
            alert('Please enter a URL.');
            generateBtn.disabled = false;
            return;
        }

        try {
            console.log('Sending request to generate QR code:', { url, label, fileType });

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
                a.download = `${label}.${fileType}`;
                console.log(`Downloading file: ${a.download}`);
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl); // Clean up object URL
            } else {
                const errorText = await response.text();
                console.error('Failed to generate QR code:', errorText);
                alert('Failed to generate QR code: ' + errorText);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code. Please try again.');
        } finally {
            generateBtn.disabled = false; // Re-enable the button
        }
    });
});
