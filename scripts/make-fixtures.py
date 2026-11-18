"""Genera datos de prueba con la misma forma que la API de EA (para EA_MOCK=1).
Uso: python3 scripts/make-fixtures.py [semilla]"""
import json, random, sys, time, os

seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1
random.seed(seed)
OUT = os.path.join(os.path.dirname(__file__), "..", "fixtures")
CLUB = "480112"

kit = {"stadName": "Garden", "kitColor1": "592653", "kitColor2": "1339431", "kitColor3": "1339431",
       "kitColor4": "14277081", "kitAColor1": "15921906", "kitThrdColor1": "12591158", "crestAssetId": "99150609"}
info = {CLUB: {"name": "La Mansion CDE", "clubId": int(CLUB), "regionId": 1396788532, "teamId": 1876, "customKit": kit}}

squad = [  # (id, gamertag, pro, pos)
    ("816742772", "Jarnkonungr", "Iorio", "goalkeeper"),
    ("1025635507", "f3233d8859b432db", "PF Gonzalez", "forward"),
    ("1695518992", "ramaa_damedin", "Rama", "forward"),
    ("1003907419829", "papu_avena90", "Avena", "midfielder"),
    ("1006122530869", "Napoleonn912", "Napo", "midfielder"),
    ("1008818888069", "ElChifi01", "Chifi", "midfielder"),
    ("1008905540555", "FedeLonardi", "Lonardi", "defender"),
    ("1009628315995", "Feikkir", "Feik", "midfielder"),
    ("1010000000001", "NicoBugge", "Bugge", "defender"),
]
rivals = ["Los Tanos FC", "Deportivo Ramos", "Atlético Fondo", "Real Asado", "Sportivo Pibes", "Club Ñandú"]

def match(i, ts):
    gf, ga = random.choice([(1, 0), (2, 1), (3, 2), (0, 1), (2, 2), (4, 1), (1, 1), (0, 2), (3, 0)])
    opp = str(30000 + i)
    on = random.sample(squad, k=random.randint(6, 9))
    if squad[0] not in on: on[0] = squad[0]
    players = {}
    scorers = [p for p in on if p[3] != "goalkeeper"]
    goals = {p[0]: 0 for p in on}; assists = {p[0]: 0 for p in on}
    for _ in range(gf):
        s = random.choice(scorers); goals[s[0]] += 1
        a = random.choice(scorers)
        if a != s: assists[a[0]] += 1
    mom = max(on, key=lambda p: goals[p[0]] * 2 + assists[p[0]] + random.random())
    for p in on:
        pa = random.randint(8, 45); pm = int(pa * random.uniform(.6, .92))
        players[p[0]] = {
            "playername": p[1], "pos": p[3], "rating": f"{random.uniform(5.8, 9.4):.2f}",
            "goals": str(goals[p[0]]), "assists": str(assists[p[0]]), "shots": str(goals[p[0]] + random.randint(0, 4)),
            "passattempts": str(pa), "passesmade": str(pm), "tackleattempts": str(random.randint(0, 9)),
            "tacklesmade": str(random.randint(0, 5)), "saves": str(random.randint(1, 7) if p[3] == "goalkeeper" else 0),
            "mom": "1" if p == mom else "0", "redcards": "0", "secondsPlayed": "5400",
            "cleansheetsany": "1" if ga == 0 else "0",
        }
    opp_players = {f"9{i}{k}": {"playername": f"rival_{k}", "pos": "midfielder", "rating": f"{random.uniform(5.5, 8.5):.2f}",
                                 "goals": "0", "assists": "0", "shots": "1", "passattempts": "20", "passesmade": "15",
                                 "tackleattempts": "3", "tacklesmade": "1", "saves": "0", "mom": "0", "redcards": "0",
                                 "secondsPlayed": "5400", "cleansheetsany": "0"} for k in range(5)}
    return {
        "matchId": str(500000000 + i), "timestamp": ts,
        "clubs": {
            CLUB: {"goals": str(gf), "goalsAgainst": str(ga), "result": "1", "matchType": "1", "details": info[CLUB]},
            opp: {"goals": str(ga), "goalsAgainst": str(gf), "result": "2", "matchType": "1",
                  "details": {"name": random.choice(rivals), "clubId": int(opp), "regionId": 1, "teamId": 1}},
        },
        "players": {CLUB: players, opp: opp_players},
        "aggregate": {},
    }

now = int(time.time()) - 3600 * (seed - 1) * 3
league = [match(i + seed * 100, now - i * 1500) for i in range(8)]
friendly = [match(i + seed * 100 + 50, now - 86400 - i * 1700) for i in range(2)]

members = []
for pid, tag, pro, pos in squad:
    gp = random.randint(40, 160)
    members.append({
        "name": tag, "proName": pro, "proPos": "0", "proHeight": str(random.randint(170, 200)),
        "proNationality": "52", "proOverall": str(random.randint(78, 92)), "gamesPlayed": str(gp),
        "winRate": str(random.randint(38, 62)), "goals": str(0 if pos == "goalkeeper" else random.randint(2, 70)),
        "assists": str(random.randint(1, 60)), "cleanSheetsDef": str(random.randint(0, 20)),
        "cleanSheetsGK": str(random.randint(5, 25) if pos == "goalkeeper" else 0),
        "shotSuccessRate": str(random.randint(20, 60)), "passesMade": str(gp * random.randint(12, 25)),
        "passSuccessRate": str(random.randint(68, 90)), "ratingAve": f"{random.uniform(6.4, 8.1):.1f}",
        "tacklesMade": str(random.randint(10, 200)), "tackleSuccessRate": str(random.randint(20, 55)),
        "manOfTheMatch": str(random.randint(0, 25)), "redCards": str(random.randint(0, 3)),
        "favoritePosition": pos,
    })

overall = [{"clubId": CLUB, "bestDivision": "1", "gamesPlayed": "160", "wins": "79", "ties": "20", "losses": "61",
            "goals": "365", "goalsAgainst": "320", "promotions": "8", "relegations": "1", "wstreak": "5",
            "unbeatenstreak": "5", "skillRating": "1951", "leagueAppearances": "147", "gamesPlayedPlayoff": "13"}]
season = [{"clubId": CLUB, "wins": "47", "losses": "36", "ties": "10", "gamesPlayed": "93", "points": "66",
           "currentDivision": "2", "bestDivision": "2", "clubName": "La Mansion CDE"}]

os.makedirs(OUT, exist_ok=True)
for name, data in [("info", info), ("overall", overall), ("members", {"members": members, "positionCount": {}}),
                   ("season", season), ("matches-leagueMatch", league), ("matches-playoffMatch", []),
                   ("matches-friendlyMatch", friendly)]:
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
print("fixtures ok, seed", seed)
