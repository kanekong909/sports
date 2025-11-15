import requests
import json
from pathlib import Path

# ==========================================================
# 🔹 CONFIGURACIÓN
# ==========================================================

# API base gratuita (sin token necesario)
API_BASE = "https://www.thesportsdb.com/api/v1/json/3"

# Puedes agregar más ligas aquí
LIGAS = [
    {"nombre": "Spanish La Liga", "pais": "España", "deporte": "Futbol"},
    {"nombre": "English Premier League", "pais": "Inglaterra", "deporte": "Futbol"},
    {"nombre": "NBA", "pais": "EE.UU.", "deporte": "Baloncesto"},
    {"nombre": "NFL", "pais": "EE.UU.", "deporte": "Futbol Americano"}
]

OUTPUT_FILE = Path("data/data.json")
OUTPUT_FILE.parent.mkdir(exist_ok=True)

# ==========================================================
# 🔹 FUNCIÓN PARA OBTENER EQUIPOS DE UNA LIGA
# ==========================================================
def obtener_equipos(nombre_liga):
    url = f"{API_BASE}/search_all_teams.php?l={nombre_liga.replace(' ', '%20')}"
    r = requests.get(url)
    data = r.json()
    if not data or not data.get("teams"):
        print(f"⚠️ No se encontraron equipos para {nombre_liga}")
        return []

    equipos = []
    for e in data["teams"]:
        equipos.append({
            "id": int(e["idTeam"]),
            "nombre": e["strTeam"],
            "fundacion": e.get("intFormedYear"),
            "entrenador": e.get("strManager"),
            "pais": e.get("strCountry"),
            "escudo_url": e.get("strTeamBadge"),
            "imagen_url": e.get("strTeamBanner"),
            "descripcion": e.get("strDescriptionEN"),
            "estadio": e.get("strStadium"),
        })
    return equipos

# ==========================================================
# 🔹 CONSTRUIR ESTRUCTURA PRINCIPAL
# ==========================================================
estructura = {"deportes": []}
deportes_dict = {}

for liga in LIGAS:
    print(f"⏳ Descargando equipos de {liga['nombre']}...")
    equipos = obtener_equipos(liga["nombre"])

    deporte = liga["deporte"]
    if deporte not in deportes_dict:
        deportes_dict[deporte] = {
            "id": len(deportes_dict) + 1,
            "nombre": deporte,
            "ligas": []
        }

    deportes_dict[deporte]["ligas"].append({
        "id": len(deportes_dict[deporte]["ligas"]) + 1,
        "nombre": liga["nombre"],
        "pais": liga["pais"],
        "equipos": equipos
    })

estructura["deportes"] = list(deportes_dict.values())

# ==========================================================
# 🔹 GUARDAR ARCHIVO JSON
# ==========================================================
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(estructura, f, indent=2, ensure_ascii=False)

print(f"\n✅ Archivo '{OUTPUT_FILE}' generado correctamente con:")
for d in estructura["deportes"]:
    print(f"   • {d['nombre']} ({len(d['ligas'])} ligas)")
