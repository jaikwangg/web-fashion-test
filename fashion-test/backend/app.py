import os
from flask import Flask, request, jsonify
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPool2D
from tensorflow.keras.models import Sequential
from sklearn.neighbors import NearestNeighbors
import numpy as np
import pickle as pkl
from numpy.linalg import norm

app = Flask(__name__)

# Load pre-trained model and data
model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model = Sequential([model, GlobalMaxPool2D()])
model.trainable = False

image_features = pkl.load(open('Images_features.pkl', 'rb'))
filenames = pkl.load(open('filenames.pkl', 'rb'))
neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
neighbors.fit(image_features)

# Helper function to extract features from the uploaded image
def extract_features_from_image(image_path):
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_expand_dim = np.expand_dims(img_array, axis=0)
    img_preprocess = preprocess_input(img_expand_dim)
    result = model.predict(img_preprocess).flatten()
    return result / norm(result)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Extract features and find similar images
    input_img_features = extract_features_from_image(file_path)
    distances, indices = neighbors.kneighbors([input_img_features])

    # Prepare recommended images based on the nearest neighbors
    recommended_images = [filenames[idx] for idx in indices[0][1:]]

    return jsonify({'recommendedImages': recommended_images})

if __name__ == '__main__':
    app.run(debug=True)
