import json

TRAITS = {
    "virat-kohli": {
        "id": "chase_master",
        "name": "Chase Master",
        "description": "Master of run chases under intense match pressure",
        "trigger": "Chasing",
        "battingBoost": 0.15
    },
    "ms-dhoni": {
        "id": "ice_finisher",
        "name": "Ice Finisher",
        "description": "Cold-blooded nerves closing out impossible death overs",
        "trigger": "DeathOvers",
        "battingBoost": 0.15
    },
    "jasprit-bumrah": {
        "id": "death_yorker_king",
        "name": "Death Yorker King",
        "description": "Unplayable pinpoint yorkers choking death overs",
        "trigger": "DeathOvers",
        "bowlingBoost": 0.20
    },
    "ab-de-villiers": {
        "id": "360_visionary",
        "name": "360° Visionary",
        "description": "Inventive strokeplay penetrating any defensive field placement",
        "trigger": "General",
        "battingBoost": 0.15
    },
    "joe-root": {
        "id": "spin_surgeon",
        "name": "Spin Surgeon",
        "description": "Surgical sweeps and reverse sweeps dominating spin-friendly tracks",
        "trigger": "SpinPitch",
        "battingBoost": 0.15
    },
    "sachin-tendulkar": {
        "id": "master_blaster",
        "name": "Master Blaster",
        "description": "Pure technical perfection dismantling world-class bowling attacks",
        "trigger": "General",
        "battingBoost": 0.15
    },
    "wasim-akram": {
        "id": "sultan_of_swing",
        "name": "Sultan of Swing",
        "description": "Devastating reverse swing and seam at express velocity",
        "trigger": "PacePitch",
        "bowlingBoost": 0.20
    },
    "shane-warne": {
        "id": "spin_wizard",
        "name": "Spin Wizard",
        "description": "Prodigious leg-break drift and psychological mastery",
        "trigger": "SpinPitch",
        "bowlingBoost": 0.20
    },
    "muttiah-muralitharan": {
        "id": "doosra_enigma",
        "name": "Doosra Enigma",
        "description": "Unreadable wrist-spin mystery turning wickets on any pitch",
        "trigger": "SpinPitch",
        "bowlingBoost": 0.20
    },
    "rohit-sharma": {
        "id": "hitman_pulverizer",
        "name": "Hitman Pulverizer",
        "description": "Effortless power hitting crushing new-ball field restrictions",
        "trigger": "Powerplay",
        "battingBoost": 0.15
    },
    "glenn-maxwell": {
        "id": "mad_max_switch",
        "name": "Mad Max Switch-Hit",
        "description": "Unpredictable boundary assault defying conventional fields",
        "trigger": "General",
        "battingBoost": 0.15
    },
    "mitchell-starc": {
        "id": "toe_crusher",
        "name": "Toe Crusher",
        "description": "Express pace swinging yorkers aimed at the stumps",
        "trigger": "DeathOvers",
        "bowlingBoost": 0.15
    },
    "ben-stokes": {
        "id": "clutch_warrior",
        "name": "Clutch Warrior",
        "description": "Heroic match-winning grit when all hope seems lost",
        "trigger": "Chasing",
        "battingBoost": 0.15
    },
    "lasith-malinga": {
        "id": "sling_king",
        "name": "Sling King",
        "description": "Round-arm dipping yorkers devastating lower orders",
        "trigger": "DeathOvers",
        "bowlingBoost": 0.20
    },
    "andre-russell": {
        "id": "monster_hitter",
        "name": "Monster Hitter",
        "description": "Tremendous bat speed clearing the biggest grounds with ease",
        "trigger": "DeathOvers",
        "battingBoost": 0.20
    },
    "sunil-narine": {
        "id": "mystery_maestro",
        "name": "Mystery Maestro",
        "description": "Compressed action and finger flick variations baffling batsmen",
        "trigger": "SpinPitch",
        "bowlingBoost": 0.15
    },
    "ravichandran-ashwin": {
        "id": "carrom_mastermind",
        "name": "Carrom Mastermind",
        "description": "Tactical wizardry and lethal carrom-ball variations",
        "trigger": "SpinPitch",
        "bowlingBoost": 0.15
    },
    "ravindra-jadeja": {
        "id": "sword_master",
        "name": "Sword Master",
        "description": "Rapid over rate, pinpoint accuracy, and dynamic late-order runs",
        "trigger": "General",
        "battingBoost": 0.10,
        "bowlingBoost": 0.10
    },
    "david-warner": {
        "id": "bull_rampage",
        "name": "Bull Rampage",
        "description": "Explosive intent tearing apart opposition bowling early",
        "trigger": "Powerplay",
        "battingBoost": 0.15
    },
    "brian-lara": {
        "id": "prince_of_trinidad",
        "name": "Prince of Trinidad",
        "description": "Flamboyant high backlift and towering match-defining centuries",
        "trigger": "General",
        "battingBoost": 0.15
    },
    "virender-sehwag": {
        "id": "fearless_slasher",
        "name": "Fearless Slasher",
        "description": "See the ball, hit the ball boundary assault in powerplays",
        "trigger": "Powerplay",
        "battingBoost": 0.15
    },
    "pat-cummins": {
        "id": "captain_clutch",
        "name": "Captain Clutch",
        "description": "Relentless test-match length and calm tactical authority",
        "trigger": "PacePitch",
        "bowlingBoost": 0.15
    },
    "rashid-khan": {
        "id": "quicksilver_googly",
        "name": "Quicksilver Googly",
        "description": "Rapid arm speed delivering sharp googlies batsmen fail to pick",
        "trigger": "SpinPitch",
        "bowlingBoost": 0.15
    },
    "kapil-dev": {
        "id": "haryana_hurricane",
        "name": "Haryana Hurricane",
        "description": "Explosive natural outswing and counter-attacking brilliance",
        "trigger": "PacePitch",
        "bowlingBoost": 0.15,
        "battingBoost": 0.10
    },
    "ian-botham": {
        "id": "beefy_audacity",
        "name": "Beefy Audacity",
        "description": "Larger than life swashbuckling sixes and momentum-swinging spells",
        "trigger": "General",
        "battingBoost": 0.10,
        "bowlingBoost": 0.10
    },
    "imran-khan": {
        "id": "cornered_tiger",
        "name": "Cornered Tiger",
        "description": "Fierce inspirational leadership and hostile reverse swing",
        "trigger": "PacePitch",
        "bowlingBoost": 0.15
    },
    "richard-hadlee": {
        "id": "rhythm_surgeon",
        "name": "Rhythm Surgeon",
        "description": "Immaculate rhythmic approach cutting batsmen in half",
        "trigger": "PacePitch",
        "bowlingBoost": 0.15
    },
    "viv-richards": {
        "id": "master_swagger",
        "name": "Master Swagger",
        "description": "Chewing gum dominance intimidating every bowler on Earth",
        "trigger": "General",
        "battingBoost": 0.15
    },
    "dale-steyn": {
        "id": "steyn_remover",
        "name": "Steyn Remover",
        "description": "Veins bulging, 150 km/h outswing ripping through top orders",
        "trigger": "PacePitch",
        "bowlingBoost": 0.20
    },
    "shakib-al-hasan": {
        "id": "bangla_dynamo",
        "name": "Bangla Dynamo",
        "description": "Allround masterclass squeezing runs and anchoring middle orders",
        "trigger": "General",
        "battingBoost": 0.10,
        "bowlingBoost": 0.10
    }
}

with open("/home/naveen/Projects/stumpd/src/data/players.json", "r", encoding="utf-8") as f:
    players = json.load(f)

count = 0
for p in players:
    if p["id"] in TRAITS:
        p["trait"] = TRAITS[p["id"]]
        count += 1
    elif "trait" in p:
        del p["trait"]

with open("/home/naveen/Projects/stumpd/src/data/players.json", "w", encoding="utf-8") as f:
    json.dump(players, f, indent=2)

print(f"Stamped traits onto {count} players in players.json")
