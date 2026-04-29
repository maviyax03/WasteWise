import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS_HEAD = 10
EPOCHS_FINE = 10

DATASET_DIR = "dataset"
MODEL_PATH = "waste_model.keras"

CATEGORIES = ["cardboard", "glass", "metal", "paper", "plastic", "trash", "unknown"]

train_data = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    class_names=CATEGORIES,
)

val_data = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    class_names=CATEGORIES,
)

data_augmentation = tf.keras.Sequential(
    [
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomContrast(0.15),
    ]
)

preprocess = tf.keras.applications.mobilenet_v2.preprocess_input

train_data = train_data.map(
    lambda x, y: (preprocess(data_augmentation(x, training=True)), y)
).prefetch(tf.data.AUTOTUNE)

val_data = val_data.map(lambda x, y: (preprocess(x), y)).prefetch(tf.data.AUTOTUNE)

base_model = MobileNetV2(
    weights="imagenet", include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

base_model.trainable = False

inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model(inputs, training=False)
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.3)(x)
outputs = Dense(len(CATEGORIES), activation="softmax")(x)

model = Model(inputs, outputs)

callbacks = [
    EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.3),
    ModelCheckpoint(MODEL_PATH, monitor="val_accuracy", save_best_only=True),
]

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

print("Stage 1: Training classifier head...")
model.fit(train_data, validation_data=val_data, epochs=EPOCHS_HEAD, callbacks=callbacks)

print("Stage 2: Fine-tuning MobileNetV2...")
base_model.trainable = True

for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(train_data, validation_data=val_data, epochs=EPOCHS_FINE, callbacks=callbacks)

model.save(MODEL_PATH)
print(f"Model saved as {MODEL_PATH}")
