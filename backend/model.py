import numpy as np
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.models import Sequential

# Fonction pour construire le modèle
def build_model(input_shape):
    model = Sequential([
        Input(shape=input_shape),
        LSTM(64),
        Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model

# Définir les dimensions d'entrée (timesteps, features)
input_shape = (10, 5)  # 10 pas de temps, 5 features
model = build_model(input_shape)
model.summary()

# Générer des données simulées
X_train = np.random.rand(100, 10, 5)  # 100 échantillons
y_train = np.random.randint(0, 2, 100)  # 0 ou 1 pour classification binaire

# Entraînement rapide
model.fit(X_train, y_train, epochs=5, batch_size=8)
X_test = np.random.rand(5, 10, 5)
predictions = model.predict(X_test)
print(predictions)
