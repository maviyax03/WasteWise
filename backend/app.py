from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv
from model import build_model, predict

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["wastewise"]
classifications = db["classifications"]

# Load model
print("Loading model...")
model = build_model()
print("Model loaded!")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/classify", methods=["POST"])
def classify():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Save file
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Classify
    result = predict(model, filepath)

    # Save to MongoDB
    record = {
        "filename": filename,
        "category": result["category"],
        "confidence": result["confidence"],
        "all_predictions": result["all_predictions"],
        "timestamp": datetime.utcnow(),
    }
    classifications.insert_one(record)

    return jsonify(
        {
            "category": result["category"],
            "confidence": result["confidence"],
            "all_predictions": result["all_predictions"],
        }
    )


@app.route("/api/stats", methods=["GET"])
def stats():
    # Total classifications
    total = classifications.count_documents({})

    # Count by category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    by_category = list(classifications.aggregate(pipeline))

    # Recent classifications
    recent = list(
        classifications.find({}, {"_id": 0, "filename": 0, "all_predictions": 0})
        .sort("timestamp", -1)
        .limit(10)
    )

    # Convert datetime to string
    for item in recent:
        item["timestamp"] = item["timestamp"].isoformat()

    # Daily trend (last 7 days)
    from datetime import timedelta

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    trend_pipeline = [
        {"$match": {"timestamp": {"$gte": seven_days_ago}}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$timestamp"},
                    "month": {"$month": "$timestamp"},
                    "day": {"$dayOfMonth": "$timestamp"},
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    trend = list(classifications.aggregate(trend_pipeline))
    trend_formatted = [
        {
            "date": f"{t['_id']['year']}-{t['_id']['month']:02d}-{t['_id']['day']:02d}",
            "count": t["count"],
        }
        for t in trend
    ]

    return jsonify(
        {
            "total": total,
            "by_category": [
                {"category": item["_id"], "count": item["count"]}
                for item in by_category
            ],
            "recent": recent,
            "trend": trend_formatted,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
