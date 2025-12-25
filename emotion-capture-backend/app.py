from flask import Flask, jsonify, request
import cv2
from deepface import DeepFace
import numpy as np
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS to allow requests from React Native
CORS(app)

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def capture_emotion_from_frame(frame):
    # Convert frame to grayscale
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    print(f"Detected faces: {len(faces)}")  # Log the number of faces detected

    emotions = []
    for (x, y, w, h) in faces:
        face_roi = rgb_frame[y:y + h, x:x + w]
        print("Analyzing face ROI...")  # Log the analysis step

        try:
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = result[0]['dominant_emotion']
            emotions.append(emotion)
            print(f"Detected emotion: {emotion}")  # Log the emotion detected
        except Exception as e:
            print(f"Error analyzing face: {e}")

    return emotions

@app.route('/capture_emotion', methods=['POST'])
def capture_emotion():
    try:
        # Get the image from the request
        image_data = request.files['image']
        image = cv2.imdecode(np.frombuffer(image_data.read(), np.uint8), cv2.IMREAD_COLOR)
        
        # Process the image and get emotion results
        emotions = capture_emotion_from_frame(image)
        
        if not emotions:
            return jsonify({'emotions': ['No emotion detected']})

        return jsonify({'emotions': emotions})
    except Exception as e:
        print(f"Error processing the image: {e}")
        return jsonify({'error': 'Error processing the image'}), 500

if __name__ == '__main__':
    app.run(debug=True, host="192.168.1.34", port=8081)
