import os
import tensorflow as tf
import numpy as np
from PIL import Image

CATEGORIES = ["cardboard", "glass", "metal", "paper", "plastic", "trash", "unknown"]
IMG_SIZE = 224
MODEL_PATH = "waste_model.keras"
CONFIDENCE_THRESHOLD = 0.65


def build_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"{MODEL_PATH} not found. Train the model first by running train_model.py"
        )

    model = tf.keras.models.load_model(MODEL_PATH)
    return model


def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))

    img_array = np.array(img).astype("float32")
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def predict(model, image_path):
    img_array = preprocess_image(image_path)
    predictions = model.predict(img_array, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))
    predicted_class = CATEGORIES[predicted_index]
    confidence = float(predictions[predicted_index])

    all_predictions = {
        CATEGORIES[i]: float(predictions[i]) for i in range(len(CATEGORIES))
    }

    if confidence < CONFIDENCE_THRESHOLD:
        predicted_class = "unknown"

    return {
        "category": predicted_class,
        "confidence": confidence,
        "all_predictions": all_predictions,
    }
