import json
import os

players = []
seen_ids = set()

def add(id, name, country, intl_eras, ipl_careers, role, sec_roles, bat, bowl, hand, b_type, is_c=False, rarity='Icon'):
    if id in seen_ids:
        return
    seen_ids.add(id)
    
    if intl_eras:
        eras = list(intl_eras)
    else:
        # Compatibility fallback decades for domestic IPL stars
        compat_eras = set()
        for c in ipl_careers:
            for e in c.get('eras', []):
                if '2008' in e:
                    compat_eras.add('2000s')
                    compat_eras.add('2010s')
                elif '2013' in e:
                    compat_eras.add('2010s')
                elif '2018' in e:
                    compat_eras.add('2010s')
                    compat_eras.add('Modern')
                elif '2022' in e:
                    compat_eras.add('Modern')
        eras = sorted(list(compat_eras)) if compat_eras else ['Modern']

    franchises = sorted(list({c['franchise'] for c in ipl_careers})) if ipl_careers else []
    
    players.append({
        "id": id,
        "name": name,
        "country": country,
        "internationalEras": intl_eras,
        "iplCareers": ipl_careers,
        "eras": eras,
        "franchise": franchises,
        "primaryRole": role,
        "secondaryRoles": [r for r in sec_roles if r in ["Opener", "TopOrder", "MiddleOrder", "Finisher", "Allrounder", "Wicketkeeper", "Spinner", "Pacer"]],
        "battingRating": max(40, min(99, int(bat))),
        "bowlingRating": max(20, min(99, int(bowl))),
        "battingHand": hand,
        "bowlingType": b_type,
        "isCaptainCandidate": is_c,
        "rarity": rarity
    })

# First run populate_roster definitions
with open('/home/naveen/Projects/stumpd/scratch/populate_roster.py') as f:
    code = f.read()

# Execute populate_roster in current namespace
exec(code, globals())
print(f"Loaded {len(players)} from populate_roster.py")

# =========================================================================
# ADDITIONAL AUTHENTIC CRICKETERS TO ENSURE COMPLETE IPL ROSTER COVERAGE
# =========================================================================

# --- CSK AUTHENTIC STARS & SQUAD MEMBERS ---
add("subramaniam-badrinath", "Subramaniam Badrinath", "India", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017"]}], "MiddleOrder", ["TopOrder"], 87, 25, "Right", "OffSpin", False, "Icon")
add("lakshmipathy-balaji", "Lakshmipathy Balaji", "India", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}], "Pacer", [], 38, 87, "Right", "FastMedium", False, "Icon")
add("doug-bollinger", "Doug Bollinger", "Australia", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012"]}], "Pacer", [], 35, 89, "Left", "FastMedium", False, "Icon")
add("shadab-jakati", "Shadab Jakati", "India", [], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017"]}], "Spinner", [], 35, 84, "Left", "LeftArmOrthodox", False, "Pro")
add("manpreet-gony", "Manpreet Gony", "India", ["2000s"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2013–2017"]}], "Pacer", [], 42, 85, "Right", "FastMedium", False, "Pro")
add("tushar-deshpande", "Tushar Deshpande", "India", ["Modern"], [{"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2022–Present"]}], "Pacer", [], 35, 88, "Right", "FastMedium", False, "Icon")
add("mukesh-choudhary", "Mukesh Choudhary", "India", [], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Pacer", [], 30, 86, "Left", "FastMedium", False, "Pro")
add("simarjeet-singh", "Simarjeet Singh", "India", [], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Pacer", [], 30, 85, "Right", "FastMedium", False, "Pro")
add("narayan-jagadeesan", "Narayan Jagadeesan", "India", [], [{"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 83, 20, "Right", "None", False, "Pro")
add("sameer-rizvi", "Sameer Rizvi", "India", [], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Finisher", [], 84, 25, "Right", "OffSpin", False, "Pro")

# --- MI AUTHENTIC STARS & SQUAD MEMBERS ---
add("munaf-patel", "Munaf Patel", "India", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 35, 89, "Right", "FastMedium", False, "Icon")
add("dhawal-kulkarni", "Dhawal Kulkarni", "India", ["2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2018–2021", "2022–Present"]}, {"franchise": "RR", "eras": ["2013–2017", "2018–2021"]}], "Pacer", [], 38, 86, "Right", "FastMedium", False, "Pro")
add("saurabh-tiwary", "Saurabh Tiwary", "India", ["2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "MiddleOrder", [], 85, 25, "Left", "None", False, "Pro")
add("aditya-tare", "Aditya Tare", "India", [], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "SRH", "eras": ["2013–2017"]}], "Wicketkeeper", ["Opener"], 84, 20, "Right", "None", False, "Pro")
add("corey-anderson", "Corey Anderson", "New Zealand", ["2010s"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2018–2021"]}], "Allrounder", ["Finisher", "Medium"], 88, 83, "Left", "Medium", False, "Icon")
add("mitchell-mcclenaghan", "Mitchell McClenaghan", "New Zealand", ["2010s"], [{"franchise": "MI", "eras": ["2013–2017", "2018–2021"]}], "Pacer", [], 40, 89, "Left", "FastMedium", False, "Icon")
add("rahul-chahar", "Rahul Chahar", "India", ["Modern"], [{"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Spinner", [], 40, 88, "Right", "LegSpin", False, "Icon")
add("akash-madhwal", "Akash Madhwal", "India", [], [{"franchise": "MI", "eras": ["2022–Present"]}], "Pacer", [], 30, 87, "Right", "FastMedium", False, "Pro")
add("nehal-wadhera", "Nehal Wadhera", "India", [], [{"franchise": "MI", "eras": ["2022–Present"]}], "MiddleOrder", [], 86, 40, "Left", "LegSpin", False, "Pro")
add("naman-dhir", "Naman Dhir", "India", [], [{"franchise": "MI", "eras": ["2022–Present"]}], "Finisher", ["Allrounder"], 85, 70, "Right", "OffSpin", False, "Pro")
add("jason-behrendorff", "Jason Behrendorff", "Australia", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 32, 88, "Left", "FastMedium", False, "Icon")

# --- RCB AUTHENTIC STARS & SQUAD MEMBERS ---
add("vinay-kumar", "Vinay Kumar", "India", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "KKR", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2013–2017"]}], "Pacer", [], 48, 87, "Right", "Medium", True, "Icon")
add("sreenath-aravind", "Sreenath Aravind", "India", ["2010s"], [{"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 35, 85, "Left", "FastMedium", False, "Pro")
add("sachin-baby", "Sachin Baby", "India", [], [{"franchise": "RR", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017", "2018–2021"]}], "MiddleOrder", [], 82, 35, "Left", "OffSpin", False, "Pro")
add("stuart-binny", "Stuart Binny", "India", ["2010s"], [{"franchise": "RR", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2013–2017"]}], "Allrounder", ["Medium"], 82, 82, "Right", "Medium", False, "Pro")
add("pawan-negi", "Pawan Negi", "India", ["2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "CSK", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "KKR", "eras": ["2018–2021"]}], "Allrounder", ["Spinner"], 78, 83, "Left", "LeftArmOrthodox", False, "Pro")
add("shahbaz-ahmed", "Shahbaz Ahmed", "India", ["Modern"], [{"franchise": "RCB", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Allrounder", ["Spinner"], 82, 84, "Left", "LeftArmOrthodox", False, "Pro")
add("anuj-rawat", "Anuj Rawat", "India", [], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Wicketkeeper", ["Finisher"], 84, 20, "Left", "None", False, "Pro")
add("mahipal-lomror", "Mahipal Lomror", "India", [], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Allrounder", ["Finisher", "Spinner"], 85, 72, "Left", "LeftArmOrthodox", False, "Pro")
add("vyshak-vijaykumar", "Vyshak Vijaykumar", "India", [], [{"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 35, 86, "Right", "FastMedium", False, "Pro")
add("yash-dayal", "Yash Dayal", "India", [], [{"franchise": "GT", "eras": ["2022–Present"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 30, 87, "Left", "FastMedium", False, "Pro")

# --- KKR AUTHENTIC STARS & SQUAD MEMBERS ---
add("laxmi-ratan-shukla", "Laxmi Ratan Shukla", "India", ["1990s"], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "Allrounder", ["Pacer"], 82, 80, "Right", "Medium", False, "Pro")
add("manvinder-bisla", "Manvinder Bisla", "India", [], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017"]}], "Wicketkeeper", ["Opener"], 87, 20, "Right", "None", False, "Icon")
add("debabrata-das", "Debabrata Das", "India", [], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}], "Finisher", [], 83, 20, "Right", "None", False, "Pro")
add("rajat-bhatia", "Rajat Bhatia", "India", [], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RR", "eras": ["2013–2017"]}], "Allrounder", ["Medium"], 82, 83, "Right", "Medium", False, "Icon")
add("pradeep-sangwan", "Pradeep Sangwan", "India", [], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 38, 84, "Left", "FastMedium", False, "Pro")
add("sheldon-jackson", "Sheldon Jackson", "India", [], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017", "2022–Present"]}], "Wicketkeeper", ["MiddleOrder"], 83, 20, "Right", "None", False, "Pro")
add("shivam-mavi", "Shivam Mavi", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 40, 87, "Right", "FastMedium", False, "Pro")
add("kamlesh-nagarkoti", "Kamlesh Nagarkoti", "India", [], [{"franchise": "KKR", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}], "Pacer", [], 35, 86, "Right", "Fast", False, "Pro")
add("prasidh-krishna", "Prasidh Krishna", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2018–2021"]}, {"franchise": "RR", "eras": ["2022–Present"]}], "Pacer", [], 35, 90, "Right", "Fast", False, "Icon")
add("harshit-rana", "Harshit Rana", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 45, 90, "Right", "FastMedium", False, "Icon")
add("vaibhav-arora", "Vaibhav Arora", "India", [], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 30, 87, "Right", "FastMedium", False, "Pro")
add("ramandeep-singh", "Ramandeep Singh", "India", ["Modern"], [{"franchise": "MI", "eras": ["2022–Present"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Finisher", ["Pacer"], 86, 75, "Right", "Medium", False, "Pro")
add("angkrish-raghuvanshi", "Angkrish Raghuvanshi", "India", [], [{"franchise": "KKR", "eras": ["2022–Present"]}], "TopOrder", [], 86, 30, "Right", "OffSpin", False, "Pro")
add("umesh-yadav", "Umesh Yadav", "India", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "KKR", "eras": ["2013–2017", "2022–Present"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 45, 90, "Right", "Fast", False, "Legend")

# --- RR AUTHENTIC STARS & SQUAD MEMBERS ---
add("swapnil-asnodkar", "Swapnil Asnodkar", "India", [], [{"franchise": "RR", "eras": ["2008–2012"]}], "Opener", [], 85, 20, "Right", "OffSpin", False, "Icon")
add("siddharth-trivedi", "Siddharth Trivedi", "India", [], [{"franchise": "RR", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 38, 86, "Right", "FastMedium", False, "Icon")
add("pravin-tambe", "Pravin Tambe", "India", [], [{"franchise": "RR", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}], "Spinner", [], 30, 87, "Right", "LegSpin", False, "Icon")
add("karun-nair", "Karun Nair", "India", ["2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2013–2017", "2022–Present"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "TopOrder", [], 88, 30, "Right", "OffSpin", True, "Icon")
add("shreyas-gopal", "Shreyas Gopal", "India", [], [{"franchise": "MI", "eras": ["2013–2017", "2022–Present"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Spinner", ["Allrounder"], 74, 88, "Right", "LegSpin", False, "Icon")
add("chetan-sakariya", "Chetan Sakariya", "India", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 32, 87, "Left", "FastMedium", False, "Pro")
add("kuldeep-sen", "Kuldeep Sen", "India", ["Modern"], [{"franchise": "RR", "eras": ["2022–Present"]}], "Pacer", [], 30, 88, "Right", "Fast", False, "Pro")
add("james-faulkner", "James Faulkner", "Australia", ["2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2013–2017"]}], "Allrounder", ["Finisher", "Pacer"], 87, 89, "Right", "FastMedium", False, "Legend")

# --- SRH / DECCAN CHARGERS AUTHENTIC STARS ---
add("venugopal-rao", "Venugopal Rao", "India", ["2000s"], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}], "MiddleOrder", [], 84, 45, "Right", "OffSpin", False, "Pro")
add("tirumalasetti-suman", "Tirumalasetti Suman", "India", [], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2008–2012"]}], "TopOrder", [], 84, 40, "Right", "OffSpin", False, "Pro")
add("karn-sharma", "Karn Sharma", "India", ["2010s"], [{"franchise": "RCB", "eras": ["2008–2012", "2022–Present"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "CSK", "eras": ["2018–2021"]}], "Spinner", ["Allrounder"], 68, 88, "Left", "LegSpin", False, "Icon")
add("naman-ojha", "Naman Ojha", "India", ["2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "SRH", "eras": ["2013–2017"]}], "Wicketkeeper", ["Opener"], 86, 20, "Right", "Medium", False, "Icon")
add("moises-henriques", "Moises Henriques", "Australia", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}], "Allrounder", ["Medium"], 85, 83, "Right", "FastMedium", True, "Icon")
add("deepak-hooda", "Deepak Hooda", "India", ["Modern"], [{"franchise": "RR", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Allrounder", ["MiddleOrder", "Spinner"], 87, 75, "Right", "OffSpin", False, "Icon")
add("siddharth-kaul", "Siddharth Kaul", "India", ["2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 35, 88, "Right", "FastMedium", False, "Icon")
add("abdul-samad", "Abdul Samad", "India", [], [{"franchise": "SRH", "eras": ["2018–2021", "2022–Present"]}], "Finisher", ["Spinner"], 86, 60, "Right", "LegSpin", False, "Pro")
add("nitish-kumar-reddy", "Nitish Kumar Reddy", "India", ["Modern"], [{"franchise": "SRH", "eras": ["2022–Present"]}], "Allrounder", ["MiddleOrder", "Pacer"], 89, 82, "Right", "FastMedium", False, "Icon")
add("jaydev-unadkat", "Jaydev Unadkat", "India", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2022–Present"]}, {"franchise": "LSG", "eras": ["2022–Present"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Pacer", [], 42, 87, "Left", "FastMedium", True, "Icon")

# --- DC AUTHENTIC STARS & SQUAD MEMBERS ---
add("dirk-nannes", "Dirk Nannes", "Australia", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2013–2017"]}], "Pacer", [], 30, 91, "Left", "Fast", False, "Icon")
add("manoj-tiwary", "Manoj Tiwary", "India", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}], "MiddleOrder", [], 87, 45, "Right", "LegSpin", False, "Icon")
add("mithun-manhas", "Mithun Manhas", "India", [], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2013–2017"]}], "MiddleOrder", [], 83, 40, "Right", "OffSpin", False, "Pro")
add("shahbaz-nadeem", "Shahbaz Nadeem", "India", ["2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "SRH", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Spinner", [], 35, 87, "Right", "LeftArmOrthodox", False, "Icon")
add("lalit-yadav", "Lalit Yadav", "India", [], [{"franchise": "DC", "eras": ["2018–2021", "2022–Present"]}], "Allrounder", ["Spinner"], 81, 80, "Right", "OffSpin", False, "Pro")
add("mukesh-kumar", "Mukesh Kumar", "India", ["Modern"], [{"franchise": "DC", "eras": ["2022–Present"]}], "Pacer", [], 35, 88, "Right", "FastMedium", False, "Icon")
add("khaleel-ahmed", "Khaleel Ahmed", "India", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2013–2017", "2022–Present"]}, {"franchise": "SRH", "eras": ["2018–2021"]}], "Pacer", [], 30, 89, "Left", "FastMedium", False, "Icon")
add("abishek-porel", "Abishek Porel", "India", [], [{"franchise": "DC", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 86, 20, "Left", "None", False, "Pro")

# --- PK (PUNJAB KINGS) AUTHENTIC STARS ---
add("george-bailey", "George Bailey", "Australia", ["2010s"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2013–2017"]}], "MiddleOrder", [], 88, 25, "Right", "Medium", True, "Icon")
add("sreesanth", "Sreesanth", "India", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2013–2017"]}], "Pacer", [], 35, 89, "Right", "FastMedium", False, "Icon")
add("vrv-singh", "VRV Singh", "India", ["2000s"], [{"franchise": "PK", "eras": ["2008–2012"]}], "Pacer", [], 35, 85, "Right", "Fast", False, "Pro")
add("parvinder-awana", "Parvinder Awana", "India", ["2010s"], [{"franchise": "PK", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 30, 86, "Right", "FastMedium", False, "Pro")
add("paul-valthaty", "Paul Valthaty", "India", [], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2008–2012", "2013–2017"]}], "Opener", ["Medium"], 86, 65, "Right", "Medium", False, "Icon")
add("mandeep-singh", "Mandeep Singh", "India", ["2010s"], [{"franchise": "KKR", "eras": ["2008–2012", "2022–Present"]}, {"franchise": "PK", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}], "TopOrder", [], 86, 25, "Right", "Medium", True, "Pro")
add("shashank-singh", "Shashank Singh", "India", [], [{"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Finisher", ["Pacer"], 89, 65, "Right", "Medium", False, "Icon")
add("ashutosh-sharma", "Ashutosh Sharma", "India", [], [{"franchise": "PK", "eras": ["2022–Present"]}], "Finisher", [], 88, 25, "Right", "Medium", False, "Icon")
add("harpreet-brar", "Harpreet Brar", "India", [], [{"franchise": "PK", "eras": ["2018–2021", "2022–Present"]}], "Allrounder", ["Spinner"], 79, 87, "Left", "LeftArmOrthodox", False, "Icon")
add("prabhsimran-singh", "Prabhsimran Singh", "India", [], [{"franchise": "PK", "eras": ["2018–2021", "2022–Present"]}], "Opener", ["Wicketkeeper"], 88, 20, "Right", "None", False, "Pro")
add("jitesh-sharma", "Jitesh Sharma", "India", ["Modern"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Wicketkeeper", ["Finisher"], 88, 20, "Right", "None", False, "Icon")

# --- LSG AUTHENTIC STARS ---
add("kyle-mayers", "Kyle Mayers", "West Indies", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Allrounder", ["Opener", "Medium"], 89, 78, "Left", "Medium", False, "Icon")
add("yash-thakur", "Yash Thakur", "India", [], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 30, 87, "Right", "FastMedium", False, "Pro")
add("krishnappa-gowtham", "Krishnappa Gowtham", "India", ["Modern"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Allrounder", ["Spinner"], 78, 86, "Right", "OffSpin", False, "Icon")
add("dushmantha-chameera", "Dushmantha Chameera", "Sri Lanka", ["2010s", "Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 32, 88, "Right", "Fast", False, "Icon")

# --- GT (GUJARAT TITANS) AUTHENTIC STARS ---
add("sai-kishore", "Ravisrinivasan Sai Kishore", "India", ["Modern"], [{"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Spinner", [], 40, 89, "Left", "LeftArmOrthodox", False, "Icon")
add("vijay-shankar", "Vijay Shankar", "India", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Allrounder", ["MiddleOrder", "Medium"], 84, 76, "Right", "Medium", False, "Icon")
add("abhinav-manohar", "Abhinav Manohar", "India", [], [{"franchise": "GT", "eras": ["2022–Present"]}], "Finisher", [], 85, 25, "Right", "LegSpin", False, "Pro")
add("joshua-little", "Joshua Little", "Ireland", ["Modern"], [{"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 30, 87, "Left", "FastMedium", False, "Icon")
add("shahrukh-khan", "Shahrukh Khan", "India", [], [{"franchise": "PK", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Finisher", ["OffSpin"], 87, 65, "Right", "OffSpin", False, "Pro")
add("matthew-wade", "Matthew Wade", "Australia", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Wicketkeeper", ["Finisher"], 88, 20, "Left", "Medium", True, "Icon")

# =========================================================================
# ADDITIONAL INTERNATIONAL TEST NATION ICONS (1980s - Modern)
# =========================================================================

# --- ADDITIONAL INDIA TEST ICONS ---
add("gundappa-viswanath", "Gundappa Viswanath", "India", ["1980s"], [], "MiddleOrder", [], 94, 25, "Right", "LegSpin", True, "Legend")
add("dilip-doshi", "Dilip Doshi", "India", ["1980s"], [], "Spinner", [], 30, 88, "Right", "LeftArmOrthodox", False, "Icon")
add("chetan-sharma", "Chetan Sharma", "India", ["1980s", "1990s"], [], "Pacer", ["Allrounder"], 65, 87, "Right", "FastMedium", False, "Icon")
add("kiran-more", "Kiran More", "India", ["1980s", "1990s"], [], "Wicketkeeper", [], 80, 20, "Right", "None", False, "Icon")
add("sadagoppan-ramesh", "Sadagoppan Ramesh", "India", ["1990s", "2000s"], [], "Opener", [], 86, 30, "Left", "OffSpin", False, "Pro")
add("wasim-jaffer", "Wasim Jaffer", "India", ["2000s"], [{"franchise": "RCB", "eras": ["2008–2012"]}], "Opener", [], 89, 25, "Right", "OffSpin", True, "Icon")
add("cheteshwar-pujara", "Cheteshwar Pujara", "India", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "CSK", "eras": ["2018–2021"]}], "TopOrder", [], 94, 25, "Right", "LegSpin", True, "Legend")
add("hanuma-vihari", "Hanuma Vihari", "India", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2018–2021"]}], "MiddleOrder", ["Allrounder", "OffSpin"], 86, 70, "Right", "OffSpin", False, "Icon")
add("akash-deep", "Akash Deep", "India", ["Modern"], [{"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 42, 88, "Right", "FastMedium", False, "Pro")
add("sarfaraz-khan", "Sarfaraz Khan", "India", ["Modern"], [{"franchise": "RCB", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}], "MiddleOrder", [], 89, 30, "Right", "LegSpin", False, "Icon")

# --- ADDITIONAL AUSTRALIA TEST ICONS ---
add("rodney-marsh", "Rodney Marsh", "Australia", ["1980s"], [], "Wicketkeeper", [], 91, 20, "Left", "None", True, "Legend")
add("dennis-lillee", "Dennis Lillee", "Australia", ["1980s"], [], "Pacer", [], 45, 99, "Right", "Fast", False, "Legend")
add("greg-chappell", "Greg Chappell", "Australia", ["1980s"], [], "TopOrder", ["Allrounder"], 96, 78, "Right", "Medium", True, "Legend")
add("jeff-thomson", "Jeff Thomson", "Australia", ["1980s"], [], "Pacer", [], 35, 98, "Right", "Fast", False, "Legend")
add("terry-alderman", "Terry Alderman", "Australia", ["1980s", "1990s"], [], "Pacer", [], 30, 91, "Right", "FastMedium", False, "Icon")
add("simon-odonnell", "Simon O'Donnell", "Australia", ["1980s", "1990s"], [], "Allrounder", ["Medium"], 85, 84, "Right", "FastMedium", False, "Icon")
add("tom-moody", "Tom Moody", "Australia", ["1980s", "1990s"], [], "Allrounder", ["MiddleOrder", "Medium"], 86, 82, "Right", "Medium", True, "Icon")
add("paul-reiffel", "Paul Reiffel", "Australia", ["1990s"], [], "Pacer", ["Allrounder"], 60, 88, "Right", "FastMedium", False, "Icon")
add("michael-kasprowicz", "Michael Kasprowicz", "Australia", ["1990s", "2000s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "Pacer", [], 38, 88, "Right", "FastMedium", False, "Icon")
add("matthew-elliott", "Matthew Elliott", "Australia", ["1990s", "2000s"], [], "Opener", [], 88, 20, "Left", "None", False, "Pro")
add("simon-katich", "Simon Katich", "Australia", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}], "Opener", ["Spinner"], 90, 65, "Left", "LeftArmUnorthodox", True, "Icon")
add("brad-hodge", "Brad Hodge", "Australia", ["2000s"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2008–2012", "2013–2017"]}], "MiddleOrder", ["TopOrder"], 91, 55, "Right", "OffSpin", True, "Icon")
add("chris-rogers", "Chris Rogers", "Australia", ["2000s", "2010s"], [], "Opener", [], 89, 20, "Left", "LegSpin", False, "Icon")
add("peter-siddle", "Peter Siddle", "Australia", ["2000s", "2010s"], [], "Pacer", [], 42, 90, "Right", "FastMedium", False, "Icon")
add("ryan-harris", "Ryan Harris", "Australia", ["2000s", "2010s"], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 55, 93, "Right", "Fast", False, "Legend")
add("james-pattinson", "James Pattinson", "Australia", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2018–2021"]}], "Pacer", [], 45, 90, "Right", "Fast", False, "Icon")
add("alex-carey", "Alex Carey", "Australia", ["Modern"], [{"franchise": "DC", "eras": ["2018–2021"]}], "Wicketkeeper", ["MiddleOrder"], 89, 20, "Left", "None", True, "Icon")
add("scott-boland", "Scott Boland", "Australia", ["Modern"], [], "Pacer", [], 30, 90, "Right", "FastMedium", False, "Icon")

# --- ADDITIONAL ENGLAND TEST ICONS ---
add("bob-willis", "Bob Willis", "England", ["1980s"], [], "Pacer", [], 30, 94, "Right", "Fast", True, "Legend")
add("derek-underwood", "Derek Underwood", "England", ["1980s"], [], "Spinner", [], 35, 94, "Right", "LeftArmOrthodox", False, "Legend")
add("john-emburey", "John Emburey", "England", ["1980s", "1990s"], [], "Spinner", ["Allrounder"], 65, 88, "Right", "OffSpin", True, "Icon")
add("phillip-defreitas", "Phillip DeFreitas", "England", ["1980s", "1990s"], [], "Allrounder", ["Pacer"], 72, 87, "Right", "FastMedium", False, "Icon")
add("jack-russell", "Jack Russell", "England", ["1980s", "1990s"], [], "Wicketkeeper", [], 84, 20, "Left", "None", False, "Icon")
add("mark-ramprakash", "Mark Ramprakash", "England", ["1990s", "2000s"], [], "TopOrder", [], 88, 45, "Right", "OffSpin", False, "Icon")
add("nick-knight", "Nick Knight", "England", ["1990s", "2000s"], [], "Opener", [], 88, 20, "Left", "None", False, "Icon")
add("andy-caddick", "Andy Caddick", "England", ["1990s", "2000s"], [], "Pacer", [], 38, 91, "Right", "FastMedium", False, "Icon")
add("monty-panesar", "Monty Panesar", "England", ["2000s", "2010s"], [], "Spinner", [], 25, 90, "Left", "LeftArmOrthodox", False, "Icon")
add("ryan-sidebottom", "Ryan Sidebottom", "England", ["2000s", "2010s"], [], "Pacer", [], 35, 89, "Left", "FastMedium", False, "Icon")
add("tim-bresnan", "Tim Bresnan", "England", ["2000s", "2010s"], [], "Allrounder", ["Pacer"], 78, 86, "Right", "FastMedium", False, "Icon")
add("steven-finn", "Steven Finn", "England", ["2010s"], [], "Pacer", [], 30, 89, "Right", "Fast", False, "Icon")
add("alex-hales", "Alex Hales", "England", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Opener", [], 91, 20, "Right", "Medium", False, "Icon")
add("dawid-malan", "Dawid Malan", "England", ["2010s", "Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}], "TopOrder", [], 92, 40, "Left", "LegSpin", False, "Icon")
add("ollie-pope", "Ollie Pope", "England", ["Modern"], [], "MiddleOrder", [], 89, 20, "Right", "None", True, "Icon")
add("zak-crawley", "Zak Crawley", "England", ["Modern"], [], "Opener", [], 89, 20, "Right", "OffSpin", False, "Icon")
add("ben-duckett", "Ben Duckett", "England", ["Modern"], [], "Opener", ["Wicketkeeper"], 90, 20, "Left", "LegSpin", False, "Icon")
add("gus-atkinson", "Gus Atkinson", "England", ["Modern"], [], "Pacer", ["Allrounder"], 68, 90, "Right", "Fast", False, "Icon")

# --- ADDITIONAL SOUTH AFRICA TEST ICONS ---
add("kepler-wessels", "Kepler Wessels", "South Africa", ["1980s", "1990s"], [], "Opener", [], 91, 30, "Left", "Medium", True, "Legend")
add("dave-richardson", "Dave Richardson", "South Africa", ["1990s"], [], "Wicketkeeper", [], 83, 20, "Right", "None", False, "Icon")
add("brett-schultz", "Brett Schultz", "South Africa", ["1990s"], [], "Pacer", [], 25, 91, "Left", "Fast", False, "Icon")
add("boeta-dippenaar", "Boeta Dippenaar", "South Africa", ["1990s", "2000s"], [], "TopOrder", [], 88, 30, "Right", "OffSpin", False, "Icon")
add("neil-mckenzie", "Neil McKenzie", "South Africa", ["2000s"], [], "Opener", [], 89, 35, "Right", "Medium", False, "Icon")
add("jacques-rudolph", "Jacques Rudolph", "South Africa", ["2000s"], [], "TopOrder", [], 88, 45, "Left", "LegSpin", False, "Icon")
add("andre-nel", "Andre Nel", "South Africa", ["2000s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "Pacer", [], 38, 88, "Right", "FastMedium", False, "Icon")
add("paul-harris", "Paul Harris", "South Africa", ["2000s"], [], "Spinner", [], 35, 87, "Left", "LeftArmOrthodox", False, "Icon")
add("ashwell-prince", "Ashwell Prince", "South Africa", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "MiddleOrder", [], 89, 35, "Left", "OffSpin", True, "Icon")
add("roelof-van-der-merwe", "Roelof van der Merwe", "South Africa", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}], "Allrounder", ["Spinner"], 81, 85, "Right", "LeftArmOrthodox", False, "Icon")
add("wayne-parnell", "Wayne Parnell", "South Africa", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 74, 87, "Left", "FastMedium", True, "Icon")
add("keshav-maharaj", "Keshav Maharaj", "South Africa", ["Modern"], [{"franchise": "RR", "eras": ["2022–Present"]}], "Spinner", [], 55, 91, "Right", "LeftArmOrthodox", True, "Legend")
add("tabraiz-shamsi", "Tabraiz Shamsi", "South Africa", ["Modern"], [{"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "RR", "eras": ["2018–2021"]}], "Spinner", [], 30, 90, "Right", "LeftArmUnorthodox", False, "Icon")
add("temba-bavuma", "Temba Bavuma", "South Africa", ["Modern"], [], "MiddleOrder", [], 88, 25, "Right", "Medium", True, "Icon")
add("rassie-van-der-dussen", "Rassie van der Dussen", "South Africa", ["Modern"], [{"franchise": "RR", "eras": ["2022–Present"]}], "TopOrder", [], 91, 30, "Right", "LegSpin", False, "Icon")
add("marco-jansen", "Marco Jansen", "South Africa", ["Modern"], [{"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 78, 91, "Right", "Fast", False, "Icon")
add("gerald-coetzee", "Gerald Coetzee", "South Africa", ["Modern"], [{"franchise": "MI", "eras": ["2022–Present"]}], "Pacer", [], 55, 91, "Right", "Fast", False, "Icon")

# --- ADDITIONAL WEST INDIES TEST ICONS ---
add("larry-gomes", "Larry Gomes", "West Indies", ["1980s"], [], "MiddleOrder", [], 90, 45, "Left", "OffSpin", False, "Icon")
add("colin-croft", "Colin Croft", "West Indies", ["1980s"], [], "Pacer", [], 30, 95, "Right", "Fast", False, "Legend")
add("ridley-jacobs", "Ridley Jacobs", "West Indies", ["1990s", "2000s"], [], "Wicketkeeper", [], 86, 20, "Left", "None", False, "Icon")
add("phil-simmons", "Phil Simmons", "West Indies", ["1980s", "1990s"], [], "Allrounder", ["Opener", "Medium"], 86, 80, "Right", "Medium", False, "Icon")
add("keith-arthurton", "Keith Arthurton", "West Indies", ["1980s", "1990s"], [], "MiddleOrder", ["Spinner"], 84, 65, "Left", "LeftArmOrthodox", False, "Pro")
add("mervyn-dillon", "Mervyn Dillon", "West Indies", ["1990s", "2000s"], [], "Pacer", [], 35, 87, "Right", "FastMedium", False, "Icon")
add("corey-collymore", "Corey Collymore", "West Indies", ["1990s", "2000s"], [], "Pacer", [], 30, 88, "Right", "FastMedium", False, "Icon")
add("fidel-edwards", "Fidel Edwards", "West Indies", ["2000s", "2010s"], [{"franchise": "SRH", "eras": ["2008–2012"]}], "Pacer", [], 30, 93, "Right", "Fast", False, "Icon")
add("jerome-taylor", "Jerome Taylor", "West Indies", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}], "Pacer", [], 52, 91, "Right", "Fast", False, "Icon")
add("darren-sammy", "Darren Sammy", "West Indies", ["2000s", "2010s"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}], "Allrounder", ["Medium"], 85, 83, "Right", "Medium", True, "Icon")
add("denesh-ramdin", "Denesh Ramdin", "West Indies", ["2000s", "2010s"], [], "Wicketkeeper", [], 85, 20, "Right", "None", True, "Icon")
add("jason-holder", "Jason Holder", "West Indies", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "KKR", "eras": ["2013–2017"]}, {"franchise": "LSG", "eras": ["2022–Present"]}, {"franchise": "RR", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 86, 90, "Right", "FastMedium", True, "Legend")
add("kemar-roach", "Kemar Roach", "West Indies", ["2000s", "2010s", "Modern"], [{"franchise": "SRH", "eras": ["2008–2012"]}], "Pacer", [], 40, 92, "Right", "Fast", False, "Legend")
add("kraigg-brathwaite", "Kraigg Brathwaite", "West Indies", ["2010s", "Modern"], [], "Opener", ["Spinner"], 89, 55, "Right", "OffSpin", True, "Icon")
add("shamar-joseph", "Shamar Joseph", "West Indies", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 35, 92, "Right", "Fast", False, "Icon")

# --- ADDITIONAL PAKISTAN TEST ICONS ---
add("wasim-bari", "Wasim Bari", "Pakistan", ["1980s"], [], "Wicketkeeper", [], 80, 20, "Right", "None", True, "Icon")
add("iqbal-qasim", "Iqbal Qasim", "Pakistan", ["1980s"], [], "Spinner", [], 35, 90, "Left", "LeftArmOrthodox", False, "Icon")
add("tauseef-ahmed", "Tauseef Ahmed", "Pakistan", ["1980s", "1990s"], [], "Spinner", [], 32, 88, "Right", "OffSpin", False, "Icon")
add("rameez-raja", "Rameez Raja", "Pakistan", ["1980s", "1990s"], [], "Opener", [], 89, 25, "Right", "LegSpin", True, "Icon")
add("aaqib-javed", "Aaqib Javed", "Pakistan", ["1980s", "1990s"], [], "Pacer", [], 35, 90, "Right", "FastMedium", False, "Icon")
add("basit-ali", "Basit Ali", "Pakistan", ["1990s"], [], "MiddleOrder", [], 87, 25, "Right", "None", False, "Icon")
add("danish-kaneria", "Danish Kaneria", "Pakistan", ["2000s", "2010s"], [], "Spinner", [], 25, 92, "Right", "LegSpin", False, "Icon")
add("mohammad-sami", "Mohammad Sami", "Pakistan", ["2000s", "2010s"], [], "Pacer", [], 38, 91, "Right", "Fast", False, "Icon")
add("umar-akmal", "Umar Akmal", "Pakistan", ["2000s", "2010s"], [], "MiddleOrder", ["Wicketkeeper"], 89, 25, "Right", "OffSpin", False, "Icon")
add("asad-shafiq", "Asad Shafiq", "Pakistan", ["2010s"], [], "MiddleOrder", [], 90, 35, "Right", "OffSpin", False, "Icon")
add("azhar-ali", "Azhar Ali", "Pakistan", ["2010s", "Modern"], [], "TopOrder", ["Opener"], 92, 45, "Right", "LegSpin", True, "Legend")
add("shan-masood", "Shan Masood", "Pakistan", ["Modern"], [], "Opener", [], 88, 25, "Left", "Medium", True, "Icon")
add("imam-ul-haq", "Imam-ul-Haq", "Pakistan", ["Modern"], [], "Opener", [], 90, 20, "Left", "LegSpin", False, "Icon")
add("abdullah-shafique", "Abdullah Shafique", "Pakistan", ["Modern"], [], "Opener", [], 89, 20, "Right", "OffSpin", False, "Icon")
add("saud-shakeel", "Saud Shakeel", "Pakistan", ["Modern"], [], "MiddleOrder", ["Spinner"], 90, 50, "Left", "LeftArmOrthodox", False, "Icon")
add("hasan-ali", "Hasan Ali", "Pakistan", ["2010s", "Modern"], [], "Pacer", ["Allrounder"], 65, 90, "Right", "FastMedium", False, "Icon")
add("abrar-ahmed", "Abrar Ahmed", "Pakistan", ["Modern"], [], "Spinner", [], 30, 91, "Right", "LegSpin", False, "Icon")

# --- ADDITIONAL NEW ZEALAND TEST ICONS ---
add("glenn-turner", "Glenn Turner", "New Zealand", ["1980s"], [], "Opener", [], 93, 25, "Right", "OffSpin", True, "Legend")
add("jeremy-coney", "Jeremy Coney", "New Zealand", ["1980s"], [], "MiddleOrder", ["Allrounder"], 89, 76, "Right", "Medium", True, "Icon")
add("lance-cairns", "Lance Cairns", "New Zealand", ["1980s"], [], "Allrounder", ["Pacer"], 78, 88, "Right", "FastMedium", False, "Icon")
add("danny-morrison", "Danny Morrison", "New Zealand", ["1980s", "1990s"], [], "Pacer", [], 32, 90, "Right", "FastMedium", False, "Icon")
add("mark-greatbatch", "Mark Greatbatch", "New Zealand", ["1980s", "1990s"], [], "Opener", [], 89, 20, "Left", "Medium", False, "Icon")
add("dion-nash", "Dion Nash", "New Zealand", ["1990s", "2000s"], [], "Allrounder", ["Pacer"], 75, 87, "Right", "FastMedium", True, "Icon")
add("adam-parore", "Adam Parore", "New Zealand", ["1990s", "2000s"], [], "Wicketkeeper", ["MiddleOrder"], 86, 20, "Right", "None", False, "Icon")
add("jacob-oram", "Jacob Oram", "New Zealand", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2013–2017"]}], "Allrounder", ["Pacer"], 86, 86, "Left", "FastMedium", False, "Icon")
add("scott-styris", "Scott Styris", "New Zealand", ["2000s", "2010s"], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2008–2012"]}], "Allrounder", ["MiddleOrder", "Medium"], 87, 83, "Right", "Medium", False, "Icon")
add("kyle-mills", "Kyle Mills", "New Zealand", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}], "Pacer", [], 48, 89, "Right", "FastMedium", False, "Icon")
add("bj-watling", "BJ Watling", "New Zealand", ["2010s", "Modern"], [], "Wicketkeeper", ["MiddleOrder"], 90, 20, "Right", "None", False, "Legend")
add("colin-de-grandhomme", "Colin de Grandhomme", "New Zealand", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2018–2021"]}], "Allrounder", ["Finisher", "Medium"], 86, 83, "Right", "FastMedium", False, "Icon")
add("neil-wagner", "Neil Wagner", "New Zealand", ["2010s", "Modern"], [], "Pacer", [], 38, 92, "Left", "FastMedium", False, "Legend")
add("tom-latham", "Tom Latham", "New Zealand", ["2010s", "Modern"], [], "Opener", ["Wicketkeeper"], 91, 20, "Left", "Medium", True, "Legend")
add("rachin-ravindra", "Rachin Ravindra", "New Zealand", ["Modern"], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Allrounder", ["TopOrder", "Spinner"], 91, 84, "Left", "LeftArmOrthodox", False, "Legend")
add("matt-henry", "Matt Henry", "New Zealand", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 45, 91, "Right", "FastMedium", False, "Icon")

# --- ADDITIONAL SRI LANKA TEST ICONS ---
add("duleep-mendis", "Duleep Mendis", "Sri Lanka", ["1980s"], [], "MiddleOrder", [], 90, 25, "Right", "None", True, "Legend")
add("roy-dias", "Roy Dias", "Sri Lanka", ["1980s"], [], "TopOrder", [], 91, 30, "Right", "OffSpin", False, "Legend")
add("sidath-wettimuny", "Sidath Wettimuny", "Sri Lanka", ["1980s"], [], "Opener", [], 88, 25, "Right", "Medium", False, "Icon")
add("asanka-gurusinha", "Asanka Gurusinha", "Sri Lanka", ["1980s", "1990s"], [], "TopOrder", [], 91, 55, "Left", "Medium", False, "Legend")
add("upul-chandana", "Upul Chandana", "Sri Lanka", ["1990s", "2000s"], [{"franchise": "KKR", "eras": ["2008–2012"]}], "Spinner", ["Allrounder"], 74, 86, "Right", "LegSpin", False, "Icon")
add("kumar-dharmasena", "Kumar Dharmasena", "Sri Lanka", ["1990s", "2000s"], [], "Allrounder", ["Spinner"], 76, 86, "Right", "OffSpin", False, "Icon")
add("russel-arnold", "Russel Arnold", "Sri Lanka", ["1990s", "2000s"], [], "MiddleOrder", ["OffSpin"], 86, 60, "Left", "OffSpin", False, "Icon")
add("dilhara-fernando", "Dilhara Fernando", "Sri Lanka", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "Pacer", [], 30, 89, "Right", "Fast", False, "Icon")
add("upul-tharanga", "Upul Tharanga", "Sri Lanka", ["2000s", "2010s"], [], "Opener", ["Wicketkeeper"], 90, 20, "Left", "OffSpin", True, "Icon")
add("suranga-lakmal", "Suranga Lakmal", "Sri Lanka", ["2010s", "Modern"], [], "Pacer", [], 35, 88, "Right", "FastMedium", True, "Icon")
add("dinesh-chandimal", "Dinesh Chandimal", "Sri Lanka", ["2010s", "Modern"], [{"franchise": "RR", "eras": ["2008–2012"]}], "Wicketkeeper", ["MiddleOrder"], 89, 20, "Right", "OffSpin", True, "Icon")
add("dimuth-karunaratne", "Dimuth Karunaratne", "Sri Lanka", ["2010s", "Modern"], [], "Opener", [], 91, 25, "Left", "Medium", True, "Legend")
add("kusal-mendis", "Kusal Mendis", "Sri Lanka", ["2010s", "Modern"], [], "TopOrder", ["Wicketkeeper"], 90, 30, "Right", "LegSpin", True, "Icon")
add("dhananjaya-de-silva", "Dhananjaya de Silva", "Sri Lanka", ["2010s", "Modern"], [], "Allrounder", ["MiddleOrder", "Spinner"], 89, 84, "Right", "OffSpin", True, "Legend")

# --- ADDITIONAL BANGLADESH & AFGHANISTAN ICONS ---
add("alok-kapali", "Alok Kapali", "Bangladesh", ["2000s"], [], "MiddleOrder", ["Spinner"], 82, 70, "Right", "LegSpin", False, "Pro")
add("aftab-ahmed", "Aftab Ahmed", "Bangladesh", ["2000s"], [], "TopOrder", [], 84, 50, "Right", "Medium", False, "Pro")
add("shahriar-nafees", "Shahriar Nafees", "Bangladesh", ["2000s", "2010s"], [], "Opener", [], 86, 20, "Left", "None", True, "Pro")
add("imrul-kayes", "Imrul Kayes", "Bangladesh", ["2000s", "2010s"], [], "Opener", [], 85, 20, "Left", "None", False, "Pro")
add("mominul-haque", "Mominul Haque", "Bangladesh", ["2010s", "Modern"], [], "TopOrder", ["Spinner"], 88, 45, "Left", "LeftArmOrthodox", True, "Icon")
add("taijul-islam", "Taijul Islam", "Bangladesh", ["2010s", "Modern"], [], "Spinner", [], 40, 89, "Left", "LeftArmOrthodox", False, "Icon")
add("soumya-sarkar", "Soumya Sarkar", "Bangladesh", ["2010s", "Modern"], [], "Opener", ["Medium"], 86, 72, "Left", "Medium", False, "Pro")
add("towhid-hridoy", "Towhid Hridoy", "Bangladesh", ["Modern"], [], "MiddleOrder", [], 87, 25, "Right", "OffSpin", False, "Icon")
add("hasan-mahmud", "Hasan Mahmud", "Bangladesh", ["Modern"], [], "Pacer", [], 30, 88, "Right", "FastMedium", False, "Icon")
add("samiullah-shinwari", "Samiullah Shinwari", "Afghanistan", ["2000s", "2010s"], [], "Allrounder", ["Spinner"], 82, 80, "Right", "LegSpin", False, "Pro")
add("hazratullah-zazai", "Hazratullah Zazai", "Afghanistan", ["Modern"], [], "Opener", [], 89, 20, "Left", "LeftArmOrthodox", False, "Icon")
add("qais-ahmad", "Qais Ahmad", "Afghanistan", ["Modern"], [], "Spinner", [], 38, 86, "Right", "LegSpin", False, "Pro")

print(f"Total authentic players assembled: {len(players)}")

output_path = "/home/naveen/Projects/stumpd/src/data/players.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(players, f, indent=2)

print(f"Successfully wrote {len(players)} authentic players to {output_path}")
