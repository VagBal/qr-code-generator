from flask import Flask, request, send_file, jsonify, render_template
import qrcode
import io
from PIL import Image, ImageDraw, ImageFont
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview')
def preview():
    url = request.args.get('url', '')
    label = request.args.get('label', '')
    file_type = request.args.get('fileType', 'png')
    if not url:
        return ('', 204)

    logging.debug(f"Generating preview for URL: {url}, Label: {label}, FileType: {file_type}")

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    if label:
        img = add_label_to_qr(img, label)

    buffer = io.BytesIO()
    if file_type.lower() == 'jpg':
        img = img.convert("RGB")  # Convert to RGB mode for JPEG
        format = 'JPEG'
    else:
        format = file_type.upper()
    img.save(buffer, format=format)
    buffer.seek(0)
    mime_type = f"image/{file_type}" if file_type in ['png', 'jpg', 'jpeg'] else "image/png"
    return send_file(buffer, mimetype=mime_type)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    url = data.get('url')
    label = data.get('label', '')
    file_type = data.get('fileType', 'png')

    if not url:
        return jsonify({"error": "URL is required"}), 400

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    if label:
        img = add_label_to_qr(img, label)

    buffer = io.BytesIO()
    if file_type.lower() == 'jpg':
        img = img.convert("RGB")  # Convert to RGB mode for JPEG
        format = 'JPEG'
    else:
        format = file_type.upper()
    img.save(buffer, format=format)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name=f'qr_code.{file_type}')

def add_label_to_qr(img, label):
    img = img.convert("RGBA")
    width, height = img.size
    label_height = 60  # Adjust height for label
    label_img = Image.new("RGBA", (width, label_height), "white")

    draw = ImageDraw.Draw(label_img)
    font = ImageFont.truetype("arialbd.ttf", 45)  # Use bold font and increase size
    text_bbox = draw.textbbox((0, 0), label, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    text_position = ((width - text_width) // 2, (label_height - text_height) // 2)  # Center text
    draw.text(text_position, label, fill="black", font=font)

    combined_img = Image.new("RGBA", (width, height + label_height), "white")
    combined_img.paste(img, (0, 0))
    combined_img.paste(label_img, (0, height))

    return combined_img

if __name__ == '__main__':
    app.run(debug=True)
