equipos = [
    "Arsenal",
    "Ajax",
    "Liverpool",
    "Manchester City",
    "Real Madrid",
    "Barcelona",
    "Bayern Munich",
    "Juventus",
    "PSG",
    "Inter",  # <--- Se añadió la coma faltante aquí
    "Chelsea",
    "Atletico de Madrid",
    "Tottenham",
    "Newcastle",
    "Athletic Club",
    "Villareal",
    "Napoli",
    "Atalanta",
    "Bayern Leverkusen",
    "Borussia Dortmund",
    "Eintracht Frankfurt",
    "Marseille",
    "Monaco",
    "PSV",
    "Sporting CP",
    "Club Brugge",
    "Union Saint-Gilloise",
    "Galatasaray",
    "Slavia Praga",
    "Olympiacos",
    "Copenhagen",
    "Bodo/Glimt",
    "Pafos",
    "Kairat Almaty",
    "Qarabag"
]

# Usamos sorted() para crear una nueva lista ordenada
equipos_ordenados = sorted(equipos)

print("### Lista de Equipos Ordenada Alfabéticamente ###")
for equipo in equipos_ordenados:
    print(equipo)