import pandas as pd
import pyodbc

# === 1. Charger le fichier Excel ===
excel_path = r"C:\Projets\CMI511\offuba.xlsx"
df = pd.read_excel(excel_path)

# Garder seulement les 100 premières lignes
df = df.head(631)

# === 2. Définir les types SQL en fonction des types pandas ===
type_mapping = {
    'object': 'VARCHAR(255)',
    'int64': 'INT',
    'float64': 'FLOAT',
    'datetime64[ns]': 'DATETIME',
    'bool': 'BIT'
}

# Créer la définition des colonnes
columns_sql = []
for col in df.columns:
    dtype = str(df[col].dtype)
    sql_type = type_mapping.get(dtype, 'VARCHAR(255)')
    clean_col = col.strip().replace(" ", "_")  # enlever espaces
    columns_sql.append(f"[{clean_col}] {sql_type}")

create_table_sql = f"""
IF OBJECT_ID('dbo.cuivre_scop', 'U') IS NOT NULL
    DROP TABLE dbo.cuivre_scop;

CREATE TABLE dbo.cuivre_scop (
    {', '.join(columns_sql)}
);
"""

# === 3. Connexion à SQL Server ===
conn_str = (
    "DRIVER={SQL Server};"
    "SERVER=TTEI-P083;"
    "DATABASE=Fuba_cuivre_scop;"
    "Trusted_Connection=yes;"
)
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# === 4. Créer la table ===
cursor.execute(create_table_sql)
conn.commit()

# === 5. Insérer les 100 lignes ===
columns_cleaned = [col.strip().replace(" ", "_") for col in df.columns]
placeholders = ", ".join(["?"] * len(columns_cleaned))
insert_sql = f"""
INSERT INTO dbo.cuivre_scop ({', '.join('[' + col + ']' for col in columns_cleaned)})
VALUES ({placeholders})
"""

for _, row in df.iterrows():
    values = [None if pd.isna(val) else val for val in row.tolist()]
    cursor.execute(insert_sql, values)

conn.commit()
cursor.close()
conn.close()

print(" Table créée et lignes insérées avec succès.")
