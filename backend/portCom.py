import serial
import time

# Configuration confirmée pour le CMI 511
ser = serial.Serial(
    port="COM5",
    baudrate=4800,
    bytesize=serial.SEVENBITS,
    parity=serial.PARITY_EVEN,
    stopbits=serial.STOPBITS_ONE,
    timeout=2
)

# Active les signaux DTR/RTS (souvent requis)
ser.setDTR(True)
ser.setRTS(True)

# Si l'appareil est en mode REMOTE, vous pouvez envoyer : ser.write(b'M\r')
# Sinon, il envoie automatiquement après chaque mesure

print("En attente d'une valeur de mesure...")
line = ser.readline().decode(errors="ignore").strip()

if line:
    print("↳ Réponse brute :", line)
    try:
        valeur_um = float(line)
        print(f"✅ Épaisseur mesurée = {valeur_um:.2f} µm")
    except ValueError:
        print("❌ Format non numérique :", line)
else:
    print("❌ Aucune donnée reçue.")

ser.close()
