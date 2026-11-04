import json

with open('/home/naveen/Projects/stumpd/src/data/players.json') as f:
    ALL_PLAYERS = {p['id']: p for p in json.load(f)}

def make_opp_player(pid, custom_attrs=None):
    if pid in ALL_PLAYERS:
        base = dict(ALL_PLAYERS[pid])
    elif custom_attrs:
        base = {
            "id": pid,
            "name": pid.replace('-', ' ').title(),
            "country": "International",
            "internationalEras": ["2010s"],
            "eras": ["2010s"],
            "rarity": "Icon",
            "secondaryRoles": []
        }
    else:
        raise ValueError(f"Player {pid} not found in players.json")
    if custom_attrs:
        if 'secondaryRoles' in custom_attrs:
            custom_attrs['secondaryRoles'] = [r for r in custom_attrs['secondaryRoles'] if r in ["Opener", "TopOrder", "MiddleOrder", "Finisher", "Allrounder", "Wicketkeeper", "Spinner", "Pacer"]]
        base.update(custom_attrs)
    if 'internationalEras' not in base:
        base['internationalEras'] = ["2010s"]
    base['id'] = f"opp_{base['id']}"
    return base

# -------------------------------------------------------------
# INTERNATIONAL TOURNAMENT OPPONENTS (7 Iconic National Teams)
# -------------------------------------------------------------
intl_opponents = [
    # 5. 1996 Sri Lanka
    {
        "id": "opp_sl_1996",
        "name": "1996 Sri Lanka",
        "era": "1990s",
        "captain": "Arjuna Ranatunga",
        "keyPlayer": "Sanath Jayasuriya",
        "description": "The innovators who redefined one-day cricket with explosive 15-over pinch-hitting and spin strangulation.",
        "strengths": ["Field-Restriction Pinch Hitting", "Subcontinent Spin Choke", "Masterclass Aravinda"],
        "venueId": "premadasa",
        "players": [
            make_opp_player("sanath-jayasuriya"),
            make_opp_player("romesh-kaluwitharana"),
            make_opp_player("asanka-gurusinha"),
            make_opp_player("aravinda-de-silva"),
            make_opp_player("arjuna-ranatunga", {"isCaptainCandidate": True}),
            make_opp_player("hashan-tillakaratne"),
            make_opp_player("roshan-mahanama"),
            make_opp_player("kumar-dharmasena"),
            make_opp_player("chaminda-vaas"),
            make_opp_player("upul-chandana"),
            make_opp_player("muttiah-muralitharan")
        ]
    },
    # 1. 1999 Pakistan
    {
        "id": "opp_pak_1999",
        "name": "1999 Pakistan",
        "era": "1990s",
        "captain": "Wasim Akram",
        "keyPlayer": "Shoaib Akhtar",
        "description": "A terrifying bowling powerhouse featuring reverse swing wizards, raw 100mph pace, and doosra spin.",
        "strengths": ["Extreme Pace Bowling", "Lethal Reverse Swing", "Unpredictable Aggression"],
        "venueId": "lords",
        "players": [
            make_opp_player("saeed-anwar"),
            make_opp_player("aamir-sohail"),
            make_opp_player("ijaz-ahmed", {"id": "ijaz-ahmed", "name": "Ijaz Ahmed", "country": "Pakistan", "primaryRole": "TopOrder", "battingRating": 88, "bowlingRating": 35, "battingHand": "Right", "bowlingType": "Medium"}),
            make_opp_player("inzamam-ul-haq"),
            make_opp_player("mohammad-yousuf"),
            make_opp_player("shahid-afridi"),
            make_opp_player("moin-khan"),
            make_opp_player("abdul-razzaq"),
            make_opp_player("wasim-akram", {"isCaptainCandidate": True}),
            make_opp_player("saqlain-mushtaq"),
            make_opp_player("shoaib-akhtar")
        ]
    },
    # 2. 2011 India
    {
        "id": "opp_ind_2011",
        "name": "2011 India",
        "era": "2010s",
        "captain": "MS Dhoni",
        "keyPlayer": "Sachin Tendulkar",
        "description": "The golden generation that fulfilled a billion dreams, balancing iconic masterclass stroke-play with tournament composure.",
        "strengths": ["All-Time Top Order", "Spin Middle-Overs Control", "Dhoni Finish"],
        "venueId": "wankhede",
        "players": [
            make_opp_player("virender-sehwag"),
            make_opp_player("sachin-tendulkar"),
            make_opp_player("gautam-gambhir"),
            make_opp_player("virat-kohli"),
            make_opp_player("yuvraj-singh"),
            make_opp_player("ms-dhoni", {"isCaptainCandidate": True}),
            make_opp_player("suresh-raina"),
            make_opp_player("harbhajan-singh"),
            make_opp_player("zaheer-khan"),
            make_opp_player("munaf-patel"),
            make_opp_player("sreesanth")
        ]
    },
    # 3. 2019 England
    {
        "id": "opp_eng_2019",
        "name": "2019 England",
        "era": "2010s",
        "captain": "Eoin Morgan",
        "keyPlayer": "Ben Stokes",
        "description": "White-ball revolutionaries boasting relentless boundary hitting down to #11 and clutch super-over firepower.",
        "strengths": ["Limitless Batting Depth", "Ultra-High Strike Rates", "Express Jofra Pace"],
        "venueId": "edgbaston",
        "players": [
            make_opp_player("jason-roy"),
            make_opp_player("jonny-bairstow"),
            make_opp_player("joe-root"),
            make_opp_player("eoin-morgan", {"isCaptainCandidate": True}),
            make_opp_player("ben-stokes"),
            make_opp_player("jos-buttler"),
            make_opp_player("moeen-ali"),
            make_opp_player("chris-woakes"),
            make_opp_player("liam-plunkett", {"id": "liam-plunkett", "name": "Liam Plunkett", "country": "England", "primaryRole": "Pacer", "battingRating": 65, "bowlingRating": 87, "battingHand": "Right", "bowlingType": "FastMedium"}),
            make_opp_player("adil-rashid"),
            make_opp_player("jofra-archer")
        ]
    },
    # 4. 1980s West Indies
    {
        "id": "opp_wi_1980s",
        "name": "1980s West Indies",
        "era": "1980s",
        "captain": "Clive Lloyd",
        "keyPlayer": "Viv Richards",
        "description": "The most dominant juggernaut in cricket history. Four 95mph pacers without helmets and the King of Swag.",
        "strengths": ["Four-Pronged Pace Terror", "Unstoppable Viv Strokeplay", "Intimidation"],
        "venueId": "kensington_oval",
        "players": [
            make_opp_player("gordon-greenidge"),
            make_opp_player("desmond-haynes"),
            make_opp_player("viv-richards"),
            make_opp_player("clive-lloyd", {"isCaptainCandidate": True}),
            make_opp_player("richie-richardson"),
            make_opp_player("gus-logie"),
            make_opp_player("jeff-dujon"),
            make_opp_player("malcolm-marshall"),
            make_opp_player("michael-holding"),
            make_opp_player("joel-garner"),
            make_opp_player("andy-roberts")
        ]
    },
    # 6. 2003 Australia
    {
        "id": "opp_aus_2003",
        "name": "2003 Australia",
        "era": "2000s",
        "captain": "Ricky Ponting",
        "keyPlayer": "Ricky Ponting",
        "description": "The undefeated world champions at the zenith of their supremacy, boasting supreme ruthless efficiency.",
        "strengths": ["Unrelenting Match Pressure", "Lethal Pace Duo", "Dominant Stroke Makers"],
        "venueId": "mcg",
        "players": [
            make_opp_player("adam-gilchrist"),
            make_opp_player("matthew-hayden"),
            make_opp_player("ricky-ponting", {"isCaptainCandidate": True}),
            make_opp_player("damien-martyn"),
            make_opp_player("darren-lehmann", {"id": "darren-lehmann", "name": "Darren Lehmann", "country": "Australia", "primaryRole": "MiddleOrder", "battingRating": 88, "bowlingRating": 72, "battingHand": "Left", "bowlingType": "LeftArmOrthodox"}),
            make_opp_player("michael-bevan"),
            make_opp_player("andrew-symonds"),
            make_opp_player("brad-hogg"),
            make_opp_player("andy-bichel"),
            make_opp_player("brett-lee"),
            make_opp_player("glenn-mcgrath")
        ]
    },
    # 7. Greatest World XI
    {
        "id": "opp_world_xi",
        "name": "All-Star World XI",
        "era": "2000s",
        "captain": "Imran Khan",
        "keyPlayer": "Shane Warne",
        "description": "The ultimate pantheon of cricket immortal gods. Every position filled by the greatest master of all time.",
        "strengths": ["God-Tier Batting", "Unplayable Spin Duo", "Deadly Reverse Swing"],
        "venueId": "eden_gardens",
        "players": [
            make_opp_player("sachin-tendulkar"),
            make_opp_player("adam-gilchrist"),
            make_opp_player("viv-richards"),
            make_opp_player("brian-lara"),
            make_opp_player("jacques-kallis"),
            make_opp_player("imran-khan", {"isCaptainCandidate": True}),
            make_opp_player("wasim-akram"),
            make_opp_player("shane-warne"),
            make_opp_player("dale-steyn"),
            make_opp_player("muttiah-muralitharan"),
            make_opp_player("glenn-mcgrath")
        ]
    }
]

# -------------------------------------------------------------
# IPL TOURNAMENT OPPONENTS (7 Iconic IPL Champion Dynasties)
# -------------------------------------------------------------
ipl_opponents = [
    # 1. 2008 RR (Shane Warne's Underdog Champions)
    {
        "id": "opp_rr_2008",
        "name": "2008 Rajasthan Royals",
        "era": "2008–2012",
        "captain": "Shane Warne",
        "keyPlayer": "Shane Watson",
        "description": "The quintessential fairytale champions led by Warne's tactical sorcery and unheralded domestic match-winners.",
        "strengths": ["Tactical Mastermind Warne", "Purple Cap Tanvir", "Fearless Power Hitting"],
        "venueId": "sawai_mansingh",
        "players": [
            make_opp_player("swapnil-asnodkar"),
            make_opp_player("kamran-akmal"),
            make_opp_player("shane-watson"),
            make_opp_player("yusuf-pathan"),
            make_opp_player("ravindra-jadeja"),
            make_opp_player("mohammad-kaif", {"id": "mohammad-kaif", "name": "Mohammad Kaif", "country": "India", "primaryRole": "MiddleOrder", "battingRating": 82, "bowlingRating": 20, "battingHand": "Right", "bowlingType": "OffSpin"}),
            make_opp_player("niraj-patel", {"id": "niraj-patel", "name": "Niraj Patel", "country": "India", "primaryRole": "MiddleOrder", "battingRating": 76, "bowlingRating": 20, "battingHand": "Left", "bowlingType": "None"}),
            make_opp_player("shane-warne", {"isCaptainCandidate": True}),
            make_opp_player("sohail-tanvir"),
            make_opp_player("siddharth-trivedi"),
            make_opp_player("munaf-patel")
        ]
    },
    # 2. 2011 CSK (MS Dhoni's Back-to-Back Champions)
    {
        "id": "opp_csk_2011",
        "name": "2011 Chennai Super Kings",
        "era": "2008–2012",
        "captain": "MS Dhoni",
        "keyPlayer": "Michael Hussey",
        "description": "The unstoppable yellow fortress dynasty, undefeated at Chepauk and ruthlessly clinical in knockout pressure.",
        "strengths": ["Spin Choke Fortress", "Mr. Cricket Consistency", "Dhoni Ice-Cold Finishes"],
        "venueId": "chepauk",
        "players": [
            make_opp_player("michael-hussey"),
            make_opp_player("murali-vijay"),
            make_opp_player("suresh-raina"),
            make_opp_player("subramaniam-badrinath"),
            make_opp_player("ms-dhoni", {"isCaptainCandidate": True}),
            make_opp_player("albie-morkel"),
            make_opp_player("dwayne-bravo"),
            make_opp_player("ravichandran-ashwin"),
            make_opp_player("shadab-jakati"),
            make_opp_player("doug-bollinger"),
            make_opp_player("lakshmipathy-balaji")
        ]
    },
    # 3. 2014 KKR (Gambhir's 14-Match Win Streak Champions)
    {
        "id": "opp_kkr_2014",
        "name": "2014 Kolkata Knight Riders",
        "era": "2013–2017",
        "captain": "Gautam Gambhir",
        "keyPlayer": "Robin Uthappa",
        "description": "The Orange Cap & mystery spin juggernaut that strung together an unprecedented 14 consecutive T20 victories.",
        "strengths": ["Uthappa Orange Cap Rampage", "Sunil Narine Mystery", "Aggressive Captaincy"],
        "venueId": "eden_gardens",
        "players": [
            make_opp_player("robin-uthappa"),
            make_opp_player("gautam-gambhir", {"isCaptainCandidate": True}),
            make_opp_player("manish-pandey"),
            make_opp_player("shakib-al-hasan"),
            make_opp_player("yusuf-pathan"),
            make_opp_player("ryan-ten-doeschate", {"id": "ryan-ten-doeschate", "name": "Ryan ten Doeschate", "country": "Netherlands", "primaryRole": "Finisher", "secondaryRoles": ["Allrounder"], "battingRating": 87, "bowlingRating": 76, "battingHand": "Right", "bowlingType": "Medium"}),
            make_opp_player("suryakumar-yadav"),
            make_opp_player("piyush-chawla"),
            make_opp_player("sunil-narine"),
            make_opp_player("morne-morkel"),
            make_opp_player("umesh-yadav")
        ]
    },
    # 4. 2016 SRH (Warner's 848-Run Title Winning Force)
    {
        "id": "opp_srh_2016",
        "name": "2016 Sunrisers Hyderabad",
        "era": "2013–2017",
        "captain": "David Warner",
        "keyPlayer": "David Warner",
        "description": "Captain Warner's 848-run masterclass paired with Bhuvneshwar and Mustafizur's unhittable death-overs choke.",
        "strengths": ["Warner God-Mode", "Death Over Yorker Choke", "Fizz Cutters"],
        "venueId": "chinnaswamy",
        "players": [
            make_opp_player("david-warner", {"isCaptainCandidate": True}),
            make_opp_player("shikhar-dhawan"),
            make_opp_player("moises-henriques"),
            make_opp_player("yuvraj-singh"),
            make_opp_player("deepak-hooda"),
            make_opp_player("ben-cutting", {"id": "ben-cutting", "name": "Ben Cutting", "country": "Australia", "primaryRole": "Allrounder", "secondaryRoles": ["Finisher"], "battingRating": 86, "bowlingRating": 82, "battingHand": "Right", "bowlingType": "FastMedium"}),
            make_opp_player("naman-ojha"),
            make_opp_player("bipul-sharma", {"id": "bipul-sharma", "name": "Bipul Sharma", "country": "India", "primaryRole": "Allrounder", "battingRating": 75, "bowlingRating": 80, "battingHand": "Left", "bowlingType": "LeftArmOrthodox"}),
            make_opp_player("bhuvneshwar-kumar"),
            make_opp_player("barinder-sran", {"id": "barinder-sran", "name": "Barinder Sran", "country": "India", "primaryRole": "Pacer", "battingRating": 30, "bowlingRating": 84, "battingHand": "Left", "bowlingType": "FastMedium"}),
            make_opp_player("mustafizur-rahman")
        ]
    },
    # 5. 2019 MI (Rohit Sharma's Ultimate Balanced Champions)
    {
        "id": "opp_mi_2019",
        "name": "2019 Mumbai Indians",
        "era": "2018–2021",
        "captain": "Rohit Sharma",
        "keyPlayer": "Jasprit Bumrah",
        "description": "The most balanced T20 franchise side in history, defending 149 in the final through Bumrah & Malinga genius.",
        "strengths": ["Pandya Power-Hitting", "Bumrah-Malinga Death Overs", "Tactical Match-Ups"],
        "venueId": "wankhede",
        "players": [
            make_opp_player("rohit-sharma", {"isCaptainCandidate": True}),
            make_opp_player("quinton-de-kock"),
            make_opp_player("suryakumar-yadav"),
            make_opp_player("ishan-kishan"),
            make_opp_player("krunal-pandya"),
            make_opp_player("hardik-pandya"),
            make_opp_player("kieron-pollard"),
            make_opp_player("rahul-chahar"),
            make_opp_player("mitchell-mcclenaghan"),
            make_opp_player("jasprit-bumrah"),
            make_opp_player("lasith-malinga")
        ]
    },
    # 6. 2022 GT (Hardik's Debut Title Winners)
    {
        "id": "opp_gt_2022",
        "name": "2022 Gujarat Titans",
        "era": "2022–Present",
        "captain": "Hardik Pandya",
        "keyPlayer": "Rashid Khan",
        "description": "The debut season sensations who defied all pre-season odds with miraculous final-over heists.",
        "strengths": ["Tewatia-Miller Ice-Vein Finishes", "Shami Powerplay Wickets", "Rashid Economy"],
        "venueId": "narendra_modi",
        "players": [
            make_opp_player("wriddhiman-saha"),
            make_opp_player("shubman-gill"),
            make_opp_player("matthew-wade"),
            make_opp_player("hardik-pandya", {"isCaptainCandidate": True}),
            make_opp_player("david-miller"),
            make_opp_player("rahul-tewatia"),
            make_opp_player("rashid-khan"),
            make_opp_player("sai-kishore"),
            make_opp_player("lockie-ferguson"),
            make_opp_player("yash-dayal"),
            make_opp_player("mohammed-shami")
        ]
    },
    # 7. 2024 KKR (Gambhir-Shreyas 270+ Run Champions)
    {
        "id": "opp_kkr_2024",
        "name": "2024 Kolkata Knight Riders",
        "era": "2022–Present",
        "captain": "Shreyas Iyer",
        "keyPlayer": "Sunil Narine",
        "description": "The hyper-aggressive modern powerhouse that blew opponents away with 270+ totals and unplayable spin-pace strangulation.",
        "strengths": ["Narine-Salt Opening Blitz", "Monster Russell Muscle", "Starc Knockout Masterclass"],
        "venueId": "eden_gardens",
        "players": [
            make_opp_player("phil-salt"),
            make_opp_player("sunil-narine"),
            make_opp_player("venkatesh-iyer"),
            make_opp_player("shreyas-iyer", {"isCaptainCandidate": True}),
            make_opp_player("rinku-singh"),
            make_opp_player("andre-russell"),
            make_opp_player("ramandeep-singh"),
            make_opp_player("mitchell-starc"),
            make_opp_player("harshit-rana"),
            make_opp_player("varun-chakaravarthy"),
            make_opp_player("vaibhav-arora")
        ]
    }
]

out_content = f'''import {{ OpponentTeam }} from '../types/tournament';

export const INTERNATIONAL_OPPONENTS: OpponentTeam[] = {json.dumps(intl_opponents, indent=2)};

export const IPL_OPPONENTS: OpponentTeam[] = {json.dumps(ipl_opponents, indent=2)};

// Default export for backward compatibility
export const OPPONENTS: OpponentTeam[] = INTERNATIONAL_OPPONENTS;
'''

with open('/home/naveen/Projects/stumpd/src/data/opponents.ts', 'w', encoding='utf-8') as f:
    f.write(out_content)

print(f"Generated opponents.ts successfully: {len(intl_opponents)} international opponents and {len(ipl_opponents)} IPL opponents")
