from glob import glob
import threading
import time
import serial
import pyodbc
from fastapi import Body
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from passlib.context import CryptContext
import smtplib
import random
import string
from email.mime.text import MIMEText

import numpy as np
import os
import pickle
import asyncio
from datetime import datetime
from collections import deque
from fastapi import WebSocket, WebSocketDisconnect
try:
    from tensorflow.keras.models import load_model as keras_load_model  # type: ignore
except Exception:
    keras_load_model = None

# === FastAPI ===
app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # ou ["*"] pour tout autoriser
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Password hashing ===
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# === SQL Server Connection ===
def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=LAPTOP-8DFJ9BLE\\MSSQLSERVER01;"
        "DATABASE=cuivre;"
        "Trusted_Connection=yes;"
    )

# Assurer l'existence de la table des alertes
def ensure_alerts_table():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Alerts' AND xtype='U')
            CREATE TABLE dbo.Alerts (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Article INT NULL,
                Mesure FLOAT NULL,
                Status NVARCHAR(100) NOT NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
            )
            """
        )
        conn.commit()
    except Exception as e:
        print(f"⚠️ Impossible de créer/valider la table Alerts: {e}")
    finally:
        try:
            conn.close()
        except Exception:
            pass

# === Configuration Port COM ===
try:
    ser = serial.Serial(
        port="COM3",
        baudrate=4800,
        bytesize=serial.SEVENBITS,
        parity=serial.PARITY_EVEN,
        stopbits=serial.STOPBITS_ONE,
        timeout=2
    )
    ser.setDTR(True)
    ser.setRTS(True)
    print("✅ Port COM3 ouvert (CMI511).")
except Exception as e:
    print(f"❌ Port COM3 indisponible : {e}")
    ser = None

last_value = ""

def read_serial():
    global last_value
    if not ser:
        print("⛔ Port série non initialisé.")
        return

    print("📡 Lecture série en cours...")
    while True:
        try:
            line = ser.readline().decode(errors="ignore").strip()
            if line:
                print(f"↳ Donnée brute reçue : '{line}'")
                try:
                    valeur_um = float(line)
                    last_value = f"{valeur_um:.2f}"
                    print(f"✅ Mesure enregistrée : {last_value} µm")
                except ValueError:
                    print(f"⚠️ Donnée non numérique ignorée : {line}")
        except Exception as e:
            print(f"❌ Erreur lecture série : {e}")
        time.sleep(0.2)

if ser:
    threading.Thread(target=read_serial, daemon=True).start()

# S'assurer que la table d'alertes existe au démarrage
ensure_alerts_table()

# === Charger le modèle (Keras .h5 prioritaire, sinon pickle .pkl) ===
BASE_DIR = os.path.dirname(__file__)
PICKLE_MODEL_PATH = os.path.join(BASE_DIR, "modele_clf.pkl")
H5_MODEL_PATH = os.path.join(BASE_DIR, "modele_nn.h5")
SCALER_PATH = os.path.join(BASE_DIR, "modele_nn_scaler.pkl")
model = None
IS_TF_MODEL = False
scaler = None
try:
    if os.path.exists(H5_MODEL_PATH) and keras_load_model is not None:
        model = keras_load_model(H5_MODEL_PATH)
        IS_TF_MODEL = True
        print(f"✅ Modèle Keras chargé depuis {H5_MODEL_PATH}")
    elif os.path.exists(PICKLE_MODEL_PATH):
        with open(PICKLE_MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print(f"✅ Modèle pickle chargé depuis {PICKLE_MODEL_PATH}")
    else:
        print(f"⚠️ Aucun modèle trouvé (.h5 ou .pkl) dans {BASE_DIR}")
    if os.path.exists(SCALER_PATH):
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        print(f"✅ Scaler chargé depuis {SCALER_PATH}")
except Exception as e:
    print(f"❌ Erreur chargement du modèle/scaler: {e}")

# Préparation d'un buffer temporel si le modèle Keras attend (batch, timesteps, features)
TIMESTEPS = 1
FEATURES = 1
window_buffer = None
if IS_TF_MODEL and hasattr(model, "input_shape"):
    try:
        # input_shape typique: (None, timesteps, features)
        shape = model.input_shape
        if isinstance(shape, (list, tuple)):
            if isinstance(shape[0], (list, tuple)):
                # Cas multi-entrées, prendre la première
                shape = shape[0]
        if len(shape) == 3:
            TIMESTEPS = shape[1] or 1
            FEATURES = shape[2] or 1
    except Exception:
        pass
window_buffer = deque(maxlen=TIMESTEPS)

def _prepare_input(value_float: float):
    # Construit X en fonction de la forme d'entrée requise
    try:
        if IS_TF_MODEL:
            if TIMESTEPS > 1:
                if not window_buffer:
                    for _ in range(TIMESTEPS):
                        window_buffer.append([0.0] * FEATURES)
                # Injecter la nouvelle valeur dans la première feature
                vec = [0.0] * FEATURES
                vec[0] = value_float
                window_buffer.append(vec)
                arr = np.array(list(window_buffer), dtype=float)  # (timesteps, features)
                X = arr.reshape(1, TIMESTEPS, FEATURES)
            else:
                # (batch, features)
                X = np.array([[value_float] + [0.0] * (FEATURES - 1)], dtype=float)
        else:
            # Modèle classique tabulaire: (batch, features)
            X = np.array([[value_float]], dtype=float)
        # Appliquer scaler si compatible
        if scaler is not None:
            try:
                if IS_TF_MODEL and TIMESTEPS > 1:
                    # Aplatir timesteps*features pour scaler puis replier
                    X_flat = X.reshape(1, TIMESTEPS * FEATURES)
                    X_flat = scaler.transform(X_flat)
                    X = X_flat.reshape(1, TIMESTEPS, FEATURES)
                else:
                    X = scaler.transform(X)
            except Exception:
                # Si le scaler ne correspond pas, on continue sans scaler
                pass
        return X
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Préparation entrée modèle échouée: {e}")

def _predict_value(value_float: float):
    if model is None:
        raise HTTPException(status_code=500, detail="Modèle non chargé")
    X = _prepare_input(value_float)
    pred = None
    proba = None
    try:
        if IS_TF_MODEL:
            y = model.predict(X)
            y_arr = np.asarray(y)
            if y_arr.ndim == 2 and y_arr.shape[1] == 1:
                proba = float(y_arr[0, 0])
                pred = int(proba >= 0.5)
            elif y_arr.ndim == 2 and y_arr.shape[1] > 1:
                row = y_arr[0]
                proba = row.tolist()
                pred = int(np.argmax(row))
            else:
                proba = float(y_arr.ravel()[0])
                pred = int(proba >= 0.5)
        else:
            if hasattr(model, "predict_proba"):
                proba_arr = model.predict_proba(X)
                if proba_arr.ndim == 2 and proba_arr.shape[1] == 2:
                    proba = float(proba_arr[0, 1])
                else:
                    proba = proba_arr[0].tolist()
            if hasattr(model, "predict"):
                p = model.predict(X)
                pred = p.tolist()[0] if getattr(p, "ndim", 1) > 0 else float(p)
            else:
                raise Exception("Le modèle ne supporte pas predict")
        return pred, proba
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {e}")

# =======================
# === API MESURES ===
# =======================
@app.get("/api/data")
def get_data():
    return JSONResponse(content={"valeur": last_value})

# =======================
# === WebSocket LIVE PREDICTIONS ===
# =======================
@app.websocket("/ws/predict")
async def ws_predict(websocket: WebSocket):
    await websocket.accept()
    last_sent = None
    try:
        while True:
            await asyncio.sleep(0.5)
            try:
                if not last_value:
                    continue
                if last_sent == last_value:
                    continue
                val = float(last_value)
                pred, proba = _predict_value(val) if model is not None else (None, None)
                payload = {
                    "value": val,
                    "prediction": pred,
                    "proba": proba,
                    "ts": datetime.utcnow().isoformat() + "Z",
                }
                await websocket.send_json(payload)
                last_sent = last_value
            except Exception as e:
                # Envoyer l'erreur côté client mais ne pas fermer la connexion tout de suite
                try:
                    await websocket.send_json({"error": str(e)})
                except Exception:
                    pass
    except WebSocketDisconnect:
        # Client déconnecté
        return

@app.get("/articles")
def get_articles():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM dbo.cuivre_scop")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# =======================
# === DASHBOARD PREDICTIONS ===
# =======================
@app.get("/api/dashboard/predictions")
def dashboard_predictions(start: str | None = None, end: str | None = None):
    if model is None:
        raise HTTPException(status_code=500, detail="Modèle non chargé")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Parse optional date filters
        from datetime import datetime, timedelta

        def parse_date(s: str | None, is_end=False):
            if not s:
                return None
            fmts = [
                "%Y-%m-%d",
                "%Y-%m-%dT%H:%M:%S",
                "%d/%m/%Y",
                "%d/%m",
                "%d-%m-%Y",
            ]
            for f in fmts:
                try:
                    dt = datetime.strptime(s, f)
                    # if format has no year (e.g., d/m), assume current year
                    if f == "%d/%m":
                        now = datetime.now()
                        dt = dt.replace(year=now.year)
                    if f in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d/%m") and is_end:
                        dt = dt + timedelta(hours=23, minutes=59, seconds=59)
                    return dt
                except Exception:
                    continue
            # last resort try ISO full
            try:
                dt = datetime.fromisoformat(s)
                if is_end and dt.time() == datetime.min.time():
                    dt = dt + timedelta(hours=23, minutes=59, seconds=59)
                return dt
            except Exception:
                return None

        start_dt = parse_date(start, is_end=False)
        end_dt = parse_date(end, is_end=True)

        if start_dt and end_dt:
            cursor.execute(
                """
                SELECT Num_OF, valeur_mesure, datetime_mesure
                FROM MESURE_OF
                WHERE datetime_mesure BETWEEN ? AND ?
                ORDER BY datetime_mesure DESC
                """,
                (start_dt, end_dt),
            )
        elif start_dt:
            cursor.execute(
                """
                SELECT Num_OF, valeur_mesure, datetime_mesure
                FROM MESURE_OF
                WHERE datetime_mesure >= ?
                ORDER BY datetime_mesure DESC
                """,
                (start_dt,),
            )
        elif end_dt:
            cursor.execute(
                """
                SELECT Num_OF, valeur_mesure, datetime_mesure
                FROM MESURE_OF
                WHERE datetime_mesure <= ?
                ORDER BY datetime_mesure DESC
                """,
                (end_dt,),
            )
        else:
            cursor.execute(
                """
                SELECT TOP 50 Num_OF, valeur_mesure, datetime_mesure
                FROM MESURE_OF
                ORDER BY datetime_mesure DESC
                """
            )
        rows = cursor.fetchall()
        results = []
        for r in rows:
            num_of = str(r[0])
            try:
                value = float(r[1])
            except Exception:
                continue
            ts = r[2]
            X = np.array([value], dtype=float).reshape(1, -1)
            pred = None
            proba = None
            try:
                if IS_TF_MODEL:
                    y = model.predict(X)
                    # y peut être (1,1) pour sigmoid, ou (1,n_classes) pour softmax
                    y_list = np.asarray(y).tolist()
                    if isinstance(y_list, list) and len(y_list) > 0:
                        row = y_list[0]
                        if isinstance(row, list) and len(row) == 1:
                            proba = float(row[0])
                            pred = int(proba >= 0.5)
                        else:
                            # multi-classes softmax
                            proba = row
                            pred = int(np.argmax(row))
                else:
                    # Compatibilité sklearn-like
                    if hasattr(model, "predict_proba"):
                        proba_arr = model.predict_proba(X)
                        if proba_arr.ndim == 2 and proba_arr.shape[1] == 2:
                            proba = float(proba_arr[0, 1])
                        else:
                            proba = proba_arr[0].tolist()
                    if hasattr(model, "predict"):
                        pred_val = model.predict(X)
                        pred = pred_val.tolist()[0] if getattr(pred_val, "ndim", 1) > 0 else float(pred_val)
                    else:
                        raise HTTPException(status_code=500, detail="Le modèle ne supporte pas predict")
                results.append({
                    "num_of": num_of,
                    "value": value,
                    "timestamp": ts.isoformat() if hasattr(ts, 'isoformat') else str(ts),
                    "prediction": pred,
                    "proba": proba,
                })
            except Exception as e:
                print(f"❌ Erreur de prédiction: {e}")
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/articles/{Num_OF}")
def get_article_by_num_of(Num_OF: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM dbo.cuivre_scop WHERE Num_OF = ?", (Num_OF,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Article non trouvé")
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

class Mesure(BaseModel):
    num_of: str
    valeur: str
    date: str

@app.post("/api/save-mesure")
def save_mesure(mesure: Mesure):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO MESURE_OF (Num_OF, valeur_mesure, datetime_mesure)
            VALUES (?, ?, ?)
        """, (mesure.num_of, mesure.valeur, mesure.date))
        conn.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/mesures/{Num_OF}")
def get_mesures_by_of(Num_OF: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 5 * FROM MESURE_OF
            WHERE Num_OF = ?
            ORDER BY datetime_mesure DESC
        """, (Num_OF,))
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# =======================
# === LOGIN / USERS ===
# =======================
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Password, Role FROM Users WHERE Email = ?", (request.email,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        hashed_password, role = row
        if not pwd_context.verify(request.password, hashed_password):
            raise HTTPException(status_code=401, detail="Mot de passe incorrect")
        return {"message": "Connexion réussie", "role": role}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/users")
def get_users():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Id, Email, Role FROM Users")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Users WHERE Id = ?", (user_id,))
        if cursor.fetchone()[0] == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        cursor.execute("DELETE FROM Users WHERE Id = ?", (user_id,))
        conn.commit()
        return {"message": "Utilisateur supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# === Ajouter utilisateur ===
class UserCreate(BaseModel):
    email: str
    firstname: str
    lastname: str
    role: str = 'operateur'

def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def send_email(receiver_email: str, password: str):
    sender_email = "imenakkari4@gmail.com"
    sender_password = "tcohhelzkrepkjxb"  # mot de passe application
    msg = MIMEText(f"Bonjour,\n\nVotre compte opérateur a été créé.\nMot de passe : {password}\n\nMerci.")
    msg['Subject'] = "Création de compte FUBA"
    msg['From'] = sender_email
    msg['To'] = receiver_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

@app.post("/api/add-user")
def add_user(user: UserCreate):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Vérifier si l'email existe déjà
        cursor.execute("SELECT COUNT(*) FROM Users WHERE Email = ?", (user.email,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")

        # Générer et hacher le mot de passe
        password = generate_password()
        hashed_password = pwd_context.hash(password)

        if user.role not in ("operateur", "admin"):
            raise HTTPException(status_code=400, detail="Rôle invalide")

        cursor.execute("""
            INSERT INTO Users (Email, Password, Role, FirstName, LastName)
            VALUES (?, ?, ?, ?, ?)
        """, (user.email, hashed_password, user.role, user.firstname, user.lastname))
        conn.commit()

        email_sent = True
        try:
            send_email(user.email, password)
        except Exception as e:
            print(f"⚠️ Erreur envoi email: {e}")
            email_sent = False
        return {"message": "Utilisateur ajouté ✅", "password": password, "email_sent": email_sent}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()



# =======================
# === DASHBOARD / ALERTES ===
# =======================
@app.get("/api/dashboard/mesures")
def dashboard_mesures():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT TOP 10 Num_OF, valeur_mesure, datetime_mesure
            FROM MESURE_OF
            ORDER BY datetime_mesure DESC
        """)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return JSONResponse(content={"mesures": results})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/dashboard/articles-count")
def dashboard_articles_count():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM dbo.cuivre_scop")
        nb_articles = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM MESURE_OF")
        nb_mesures = cursor.fetchone()[0]
        return JSONResponse(content={
            "nb_articles": nb_articles,
            "nb_mesures": nb_mesures
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/alertes")
def get_alertes():
   
    return [
        {"article": 93115, "mesure": 66.4, "status": "Mesure hors tolérance"},
        {"article": 93115, "mesure": 63.5, "status": "Mesure hors tolérance"},
        {"article": 93115, "mesure": 30.1, "status": "ok "},
        {"article": 93115, "mesure": 44.5, "status": "ok"},
        {"article": 93116, "mesure": 25.1, "status": "ok"},
        {"article": 93116, "mesure": 25.1, "status": "ok"},
        {"article": 93116, "mesure": 26.1, "status": "ok"},
        {"article": 93116, "mesure": 25.1, "status": "ok"},
    ]

# Valeur tolérance
MIN_TOLERANCE = 20.0
MAX_TOLERANCE = 60.0

# Simuler quelques mesures
measures = [
    {"article": 93115, "mesure": 63.5},
    {"article": 93115, "mesure": 66.4},
    {"article": 93115, "mesure": 30.1},
    {"article": 93116, "mesure": 25.1},
    {"article": 93117, "mesure": 26.1},
    {"article": 93116, "mesure": 25.1},
    {"article": 93118, "mesure": 45.2},
    {"article": 93116, "mesure": 44.},
]

@app.get("/alertes")
def get_alertes():
    alertes = []
    for i in range(10):  # 10 articles simulés
        mesure = round(random.uniform(20, 70), 1)  # mesure entre 20 et 70
        status = "alerte" if mesure > 60 else "ok"  # tolérance > 60
        alertes.append({
            "article": 93100 + i,
            "mesure": mesure,
            "status": status
        })
    return alertes
alertes = []

@app.post("/alertes")
def ajouter_alerte(alerte: dict = Body(...)):
    alertes.append(alerte)
    return {"message": "Alerte ajoutée", "alerte": alerte}

@app.get("/alertes")
def get_alertes():
    return alertes

# =======================
# === API ALERTS (SQL Server) ===
# =======================
class AlertIn(BaseModel):
    article: int | None = None
    mesure: float | None = None
    status: str

@app.post("/api/alerts")
def create_alert(alert: AlertIn):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO dbo.Alerts (Article, Mesure, Status)
            VALUES (?, ?, ?)
            """,
            (alert.article, alert.mesure, alert.status),
        )
        conn.commit()
        return {"message": "Alerte enregistrée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/alerts")
def list_alerts(limit: int = 50):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT TOP {limit} Id, Article, Mesure, Status, CreatedAt
            FROM dbo.Alerts
            ORDER BY CreatedAt DESC
            """
        )
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()