import json

# Comprehensive database of cricketers with authentic National Eras and IPL franchise careers
# IPLEras: '2008–2012', '2013–2017', '2018–2021', '2022–Present'
# Decades: '1980s', '1990s', '2000s', '2010s', 'Modern'

players = []

def add_player(id, name, country, intl_eras, ipl_careers, role, sec_roles, bat, bowl, hand, b_type, is_c=False, rarity='Icon'):
    # Maintain backwards-compatible fields
    eras = list(intl_eras)
    franchises = [c['franchise'] for c in ipl_careers] if ipl_careers else []
    
    players.append({
        "id": id,
        "name": name,
        "country": country,
        "internationalEras": intl_eras,
        "iplCareers": ipl_careers,
        "eras": eras,
        "franchise": franchises,
        "primaryRole": role,
        "secondaryRoles": sec_roles,
        "battingRating": max(40, min(99, bat)),
        "bowlingRating": max(20, min(99, bowl)),
        "battingHand": hand,
        "bowlingType": b_type,
        "isCaptainCandidate": is_c,
        "rarity": rarity
    })

# --- INDIA LEGENDS & STARS ---
add_player("sachin-tendulkar", "Sachin Tendulkar", "India", ["1990s", "2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}], "Opener", ["TopOrder"], 99, 58, "Right", "OffSpin", True, "Legend")
add_player("sunil-gavaskar", "Sunil Gavaskar", "India", ["1980s"], [], "Opener", ["TopOrder"], 96, 25, "Right", "None", True, "Legend")
add_player("kapil-dev", "Kapil Dev", "India", ["1980s", "1990s"], [], "Allrounder", ["Pacer"], 88, 92, "Right", "FastMedium", True, "Legend")
add_player("rohit-sharma", "Rohit Sharma", "India", ["2000s", "2010s", "Modern"], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Opener", ["TopOrder"], 95, 45, "Right", "OffSpin", True, "Legend")
add_player("virat-kohli", "Virat Kohli", "India", ["2000s", "2010s", "Modern"], [{"franchise": "RCB", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "TopOrder", ["Opener"], 98, 40, "Right", "Medium", True, "Legend")
add_player("ms-dhoni", "MS Dhoni", "India", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Wicketkeeper", ["Finisher"], 94, 25, "Right", "Medium", True, "Legend")
add_player("rahul-dravid", "Rahul Dravid", "India", ["1990s", "2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2008–2012", "2013–2017"]}], "TopOrder", ["Wicketkeeper"], 94, 25, "Right", "OffSpin", True, "Legend")
add_player("sourav-ganguly", "Sourav Ganguly", "India", ["1990s", "2000s"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012"]}], "TopOrder", ["Opener"], 91, 55, "Left", "Medium", True, "Legend")
add_player("virender-sehwag", "Virender Sehwag", "India", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}], "Opener", ["MiddleOrder"], 94, 52, "Right", "OffSpin", True, "Legend")
add_player("yuvraj-singh", "Yuvraj Singh", "India", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2018–2021"]}], "MiddleOrder", ["Allrounder"], 92, 70, "Left", "LeftArmOrthodox", True, "Legend")
add_player("anil-kumble", "Anil Kumble", "India", ["1990s", "2000s"], [{"franchise": "RCB", "eras": ["2008–2012"]}], "Spinner", [], 45, 96, "Right", "LegSpin", True, "Legend")
add_player("jasprit-bumrah", "Jasprit Bumrah", "India", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2013–2017", "2018–2021", "2022–Present"]}], "Pacer", [], 40, 98, "Right", "Fast", True, "Legend")
add_player("ravichandran-ashwin", "Ravichandran Ashwin", "India", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "RR", "eras": ["2022–Present"]}], "Spinner", ["Allrounder"], 74, 94, "Right", "OffSpin", True, "Legend")
add_player("ravindra-jadeja", "Ravindra Jadeja", "India", ["2000s", "2010s", "Modern"], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Allrounder", ["Spinner"], 85, 91, "Left", "LeftArmOrthodox", True, "Legend")
add_player("zaheer-khan", "Zaheer Khan", "India", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "Pacer", [], 42, 92, "Left", "FastMedium", False, "Legend")
add_player("harbhajan-singh", "Harbhajan Singh", "India", ["1990s", "2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2018–2021"]}], "Spinner", ["Allrounder"], 62, 89, "Right", "OffSpin", True, "Legend")
add_player("gautam-gambhir", "Gautam Gambhir", "India", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}], "Opener", ["TopOrder"], 92, 25, "Left", "LegSpin", True, "Legend")
add_player("suresh-raina", "Suresh Raina", "India", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017", "2018–2021"]}], "TopOrder", ["MiddleOrder"], 92, 58, "Left", "OffSpin", True, "Legend")
add_player("shikhar-dhawan", "Shikhar Dhawan", "India", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "MI", "eras": ["2008–2012"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Opener", [], 89, 25, "Left", "OffSpin", True, "Icon")
add_player("hardik-pandya", "Hardik Pandya", "India", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2013–2017", "2018–2021", "2022–Present"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Allrounder", ["Finisher"], 88, 85, "Right", "FastMedium", True, "Legend")
add_player("kl-rahul", "KL Rahul", "India", ["2010s", "Modern"], [{"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Opener", ["Wicketkeeper"], 92, 25, "Right", "Medium", True, "Icon")
add_player("rishabh-pant", "Rishabh Pant", "India", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2013–2017", "2018–2021", "2022–Present"]}], "Wicketkeeper", ["MiddleOrder"], 91, 25, "Left", "None", True, "Icon")
add_player("suryakumar-yadav", "Suryakumar Yadav", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2008–2012", "2018–2021", "2022–Present"]}], "MiddleOrder", ["TopOrder"], 95, 30, "Right", "Medium", True, "Legend")
add_player("shubman-gill", "Shubman Gill", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Opener", ["TopOrder"], 92, 25, "Right", "OffSpin", True, "Icon")
add_player("mohammed-shami", "Mohammed Shami", "India", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 44, 94, "Right", "Fast", False, "Icon")
add_player("bhuvneshwar-kumar", "Bhuvneshwar Kumar", "India", ["2010s", "Modern"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021", "2022–Present"]}], "Pacer", ["Allrounder"], 58, 91, "Right", "Medium", False, "Icon")
add_player("yuzvendra-chahal", "Yuzvendra Chahal", "India", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RR", "eras": ["2022–Present"]}], "Spinner", [], 40, 93, "Right", "LegSpin", False, "Icon")
add_player("kuldeep-yadav", "Kuldeep Yadav", "India", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}], "Spinner", [], 45, 93, "Left", "LeftArmUnorthodox", False, "Icon")
add_player("mohammed-siraj", "Mohammed Siraj", "India", ["Modern"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2018–2021", "2022–Present"]}], "Pacer", [], 40, 89, "Right", "FastMedium", False, "Icon")
add_player("yashasvi-jaiswal", "Yashasvi Jaiswal", "India", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021", "2022–Present"]}], "Opener", [], 91, 40, "Left", "LegSpin", False, "Icon")
add_player("rinku-singh", "Rinku Singh", "India", ["Modern"], [{"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "KKR", "eras": ["2018–2021", "2022–Present"]}], "Finisher", ["MiddleOrder"], 89, 30, "Left", "OffSpin", False, "Icon")
add_player("sanju-samson", "Sanju Samson", "India", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "RR", "eras": ["2013–2017", "2018–2021", "2022–Present"]}], "Wicketkeeper", ["TopOrder"], 90, 25, "Right", "None", True, "Icon")
add_player("ruturaj-gaikwad", "Ruturaj Gaikwad", "India", ["Modern"], [{"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "Opener", ["TopOrder"], 89, 25, "Right", "OffSpin", True, "Icon")
add_player("axar-patel", "Axar Patel", "India", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021", "2022–Present"]}], "Allrounder", ["Spinner"], 81, 88, "Left", "LeftArmOrthodox", False, "Icon")
add_player("shreyas-iyer", "Shreyas Iyer", "India", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "TopOrder", ["MiddleOrder"], 89, 30, "Right", "LegSpin", True, "Icon")
add_player("ishan-kishan", "Ishan Kishan", "India", ["Modern"], [{"franchise": "MI", "eras": ["2018–2021", "2022–Present"]}], "Wicketkeeper", ["Opener"], 87, 25, "Left", "None", False, "Pro")
add_player("arshdeep-singh", "Arshdeep Singh", "India", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021", "2022–Present"]}], "Pacer", [], 40, 89, "Left", "FastMedium", False, "Icon")
add_player("dinesh-karthik", "Dinesh Karthik", "India", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017", "2022–Present"]}, {"franchise": "KKR", "eras": ["2018–2021"]}], "Wicketkeeper", ["Finisher"], 86, 25, "Right", "OffSpin", True, "Icon")
add_player("ambati-rayudu", "Ambati Rayudu", "India", ["2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "MiddleOrder", ["Wicketkeeper"], 85, 30, "Right", "OffSpin", False, "Icon")
add_player("robin-uthappa", "Robin Uthappa", "India", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "Opener", ["Wicketkeeper"], 86, 25, "Right", "Medium", False, "Icon")
add_player("yusuf-pathan", "Yusuf Pathan", "India", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "SRH", "eras": ["2018–2021"]}], "Allrounder", ["Finisher"], 87, 76, "Right", "OffSpin", False, "Icon")
add_player("irfan-pathan", "Irfan Pathan", "India", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "CSK", "eras": ["2013–2017"]}], "Allrounder", ["Pacer"], 78, 86, "Left", "FastMedium", False, "Icon")
add_player("amit-mishra", "Amit Mishra", "India", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Spinner", [], 40, 89, "Right", "LegSpin", False, "Icon")
add_player("piyush-chawla", "Piyush Chawla", "India", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "KKR", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2018–2021", "2022–Present"]}], "Spinner", ["Allrounder"], 60, 86, "Right", "LegSpin", False, "Icon")
add_player("mohit-sharma", "Mohit Sharma", "India", ["2010s"], [{"franchise": "CSK", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Pacer", [], 40, 85, "Right", "Medium", False, "Pro")
add_player("deepak-chahar", "Deepak Chahar", "India", ["Modern"], [{"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "Pacer", ["Allrounder"], 65, 87, "Right", "Medium", False, "Icon")
add_player("shivam-dube", "Shivam Dube", "India", ["Modern"], [{"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2022–Present"]}], "Allrounder", ["Finisher"], 87, 68, "Left", "Medium", False, "Icon")
add_player("rahul-tewatia", "Rahul Tewatia", "India", ["Modern"], [{"franchise": "RR", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Finisher", ["Allrounder"], 84, 76, "Left", "LegSpin", False, "Pro")
add_player("sai-sudharsan", "Sai Sudharsan", "India", ["Modern"], [{"franchise": "GT", "eras": ["2022–Present"]}], "TopOrder", [], 86, 25, "Left", "LegSpin", False, "Pro")
add_player("abhishek-sharma", "Abhishek Sharma", "India", ["Modern"], [{"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2018–2021", "2022–Present"]}], "Opener", ["Allrounder"], 88, 70, "Left", "LeftArmOrthodox", False, "Icon")
add_player("t-natarajan", "T Natarajan", "India", ["Modern"], [{"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2018–2021", "2022–Present"]}], "Pacer", [], 40, 87, "Left", "FastMedium", False, "Pro")
add_player("varun-chakravarthy", "Varun Chakravarthy", "India", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2018–2021", "2022–Present"]}], "Spinner", [], 40, 90, "Right", "OffSpin", False, "Icon")
add_player("ravi-bishnoi", "Ravi Bishnoi", "India", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Spinner", [], 40, 88, "Right", "LegSpin", False, "Icon")
add_player("ayush-badoni", "Ayush Badoni", "India", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Finisher", [], 82, 50, "Right", "OffSpin", False, "Pro")
add_player("mayank-yadav", "Mayank Yadav", "India", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 40, 88, "Right", "Fast", False, "Pro")
add_player("harshit-rana", "Harshit Rana", "India", ["Modern"], [{"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 42, 85, "Right", "FastMedium", False, "Pro")

# --- OVERSEAS IPL MARQUEE STARS ---
add_player("ab-de-villiers", "AB de Villiers", "South Africa", ["2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017", "2018–2021"]}], "MiddleOrder", ["Wicketkeeper"], 98, 30, "Right", "Medium", True, "Legend")
add_player("chris-gayle", "Chris Gayle", "West Indies", ["2000s", "2010s"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "PK", "eras": ["2018–2021"]}], "Opener", [], 97, 60, "Left", "OffSpin", True, "Legend")
add_player("lasith-malinga", "Lasith Malinga", "Sri Lanka", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017", "2018–2021"]}], "Pacer", [], 40, 98, "Right", "Fast", True, "Legend")
add_player("kieron-pollard", "Kieron Pollard", "West Indies", ["2010s"], [{"franchise": "MI", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Allrounder", ["Finisher"], 91, 78, "Right", "Medium", True, "Legend")
add_player("andre-russell", "Andre Russell", "West Indies", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2013–2017", "2018–2021", "2022–Present"]}], "Allrounder", ["Finisher"], 94, 88, "Right", "Fast", True, "Legend")
add_player("sunil-narine", "Sunil Narine", "West Indies", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Allrounder", ["Spinner", "Opener"], 86, 96, "Left", "OffSpin", True, "Legend")
add_player("david-warner", "David Warner", "Australia", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2013–2017", "2022–Present"]}, {"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}], "Opener", [], 96, 25, "Left", "LegSpin", True, "Legend")
add_player("shane-watson", "Shane Watson", "Australia", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "CSK", "eras": ["2018–2021"]}], "Allrounder", ["Opener"], 91, 86, "Right", "FastMedium", True, "Legend")
add_player("dwayne-bravo", "Dwayne Bravo", "West Indies", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2008–2012", "2013–2017", "2018–2021", "2022–Present"]}], "Allrounder", ["Finisher"], 84, 91, "Right", "Medium", True, "Legend")
add_player("glenn-maxwell", "Glenn Maxwell", "Australia", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2018–2021", "2022–Present"]}], "Allrounder", ["MiddleOrder"], 92, 77, "Right", "OffSpin", True, "Legend")
add_player("faf-du-plessis", "Faf du Plessis", "South Africa", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "TopOrder", ["Opener"], 90, 25, "Right", "LegSpin", True, "Icon")
add_player("jos-buttler", "Jos Buttler", "England", ["2010s", "Modern"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "RR", "eras": ["2018–2021", "2022–Present"]}], "Wicketkeeper", ["Opener"], 95, 25, "Right", "None", True, "Legend")
add_player("rashid-khan", "Rashid Khan", "Afghanistan", ["Modern"], [{"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Spinner", ["Allrounder"], 77, 97, "Right", "LegSpin", True, "Legend")
add_player("kane-williamson", "Kane Williamson", "New Zealand", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017", "2018–2021", "2022–Present"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "TopOrder", [], 92, 45, "Right", "OffSpin", True, "Legend")
add_player("trent-boult", "Trent Boult", "New Zealand", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "KKR", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "RR", "eras": ["2022–Present"]}], "Pacer", [], 40, 93, "Left", "FastMedium", False, "Legend")
add_player("quinton-de-kock", "Quinton de Kock", "South Africa", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 91, 25, "Left", "None", True, "Icon")
add_player("kagiso-rabada", "Kagiso Rabada", "South Africa", ["Modern"], [{"franchise": "DC", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Pacer", [], 45, 93, "Right", "Fast", False, "Legend")
add_player("marcus-stoinis", "Marcus Stoinis", "Australia", ["2010s", "Modern"], [{"franchise": "PK", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Allrounder", ["Finisher"], 87, 81, "Right", "Medium", False, "Icon")
add_player("nicholas-pooran", "Nicholas Pooran", "West Indies", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Wicketkeeper", ["Finisher"], 91, 30, "Left", "OffSpin", True, "Icon")
add_player("pat-cummins", "Pat Cummins", "Australia", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2013–2017", "2018–2021", "2022–Present"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Pacer", ["Allrounder"], 77, 94, "Right", "Fast", True, "Legend")
add_player("mitchell-starc", "Mitchell Starc", "Australia", ["2010s", "Modern"], [{"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", [], 44, 94, "Left", "Fast", False, "Legend")
add_player("travis-head", "Travis Head", "Australia", ["Modern"], [{"franchise": "RCB", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Opener", ["TopOrder"], 94, 60, "Left", "OffSpin", False, "Icon")
add_player("heinrich-klaasen", "Heinrich Klaasen", "South Africa", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Wicketkeeper", ["Finisher"], 94, 25, "Right", "OffSpin", False, "Legend")
add_player("david-miller", "David Miller", "South Africa", ["2010s", "Modern"], [{"franchise": "PK", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}], "Finisher", ["MiddleOrder"], 90, 25, "Left", "RightArmOffbreak", False, "Icon")
add_player("shane-warne", "Shane Warne", "Australia", ["1990s", "2000s"], [{"franchise": "RR", "eras": ["2008–2012"]}], "Spinner", [], 55, 98, "Right", "LegSpin", True, "Legend")
add_player("adam-gilchrist", "Adam Gilchrist", "Australia", ["1990s", "2000s"], [{"franchise": "SRH", "eras": ["2008–2012"]}, {"franchise": "PK", "eras": ["2008–2012", "2013–2017"]}], "Wicketkeeper", ["Opener"], 96, 25, "Left", "OffSpin", True, "Legend")
add_player("matthew-hayden", "Matthew Hayden", "Australia", ["1990s", "2000s"], [{"franchise": "CSK", "eras": ["2008–2012"]}], "Opener", [], 92, 25, "Left", "Medium", False, "Legend")
add_player("michael-hussey", "Michael Hussey", "Australia", ["2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "MI", "eras": ["2013–2017"]}], "TopOrder", ["MiddleOrder"], 92, 35, "Left", "Medium", True, "Legend")
add_player("dale-steyn", "Dale Steyn", "South Africa", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012", "2018–2021"]}, {"franchise": "SRH", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "GT", "eras": []}], "Pacer", [], 40, 97, "Right", "Fast", False, "Legend")
add_player("shakib-al-hasan", "Shakib Al Hasan", "Bangladesh", ["2000s", "2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012", "2013–2017", "2018–2021"]}, {"franchise": "SRH", "eras": ["2018–2021"]}], "Allrounder", ["Spinner"], 88, 92, "Left", "LeftArmOrthodox", True, "Legend")
add_player("mustafizur-rahman", "Mustafizur Rahman", "Bangladesh", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2022–Present"]}, {"franchise": "CSK", "eras": ["2022–Present"]}], "Pacer", [], 40, 89, "Left", "FastMedium", False, "Icon")
add_player("brendon-mccullum", "Brendon McCullum", "New Zealand", ["2000s", "2010s"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "CSK", "eras": ["2013–2017"]}, {"franchise": "RCB", "eras": ["2018–2021"]}], "Opener", ["Wicketkeeper"], 92, 25, "Right", "Medium", True, "Legend")
add_player("morne-morkel", "Morne Morkel", "South Africa", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2008–2012", "2013–2017"]}, {"franchise": "KKR", "eras": ["2013–2017"]}], "Pacer", [], 40, 88, "Right", "Fast", False, "Icon")
add_player("mitchell-mcclenaghan", "Mitchell McClenaghan", "New Zealand", ["2010s"], [{"franchise": "MI", "eras": ["2013–2017", "2018–2021"]}], "Pacer", [], 40, 84, "Left", "FastMedium", False, "Pro")
add_player("alzarri-joseph", "Alzarri Joseph", "West Indies", ["Modern"], [{"franchise": "MI", "eras": ["2018–2021"]}, {"franchise": "GT", "eras": ["2022–Present"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 42, 85, "Right", "Fast", False, "Pro")
add_player("wanindu-hasaranga", "Wanindu Hasaranga", "Sri Lanka", ["Modern"], [{"franchise": "RCB", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Allrounder", ["Spinner"], 79, 90, "Right", "LegSpin", False, "Icon")
add_player("matheesha-pathirana", "Matheesha Pathirana", "Sri Lanka", ["Modern"], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Pacer", [], 40, 89, "Right", "Fast", False, "Icon")
add_player("moeen-ali", "Moeen Ali", "England", ["2010s", "Modern"], [{"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "Allrounder", ["Spinner"], 84, 82, "Left", "OffSpin", True, "Icon")
add_player("devon-conway", "Devon Conway", "New Zealand", ["Modern"], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Opener", ["Wicketkeeper"], 90, 25, "Left", "RightArmMedium", False, "Icon")
add_player("rachin-ravindra", "Rachin Ravindra", "New Zealand", ["Modern"], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Opener", ["Allrounder"], 87, 72, "Left", "LeftArmOrthodox", False, "Pro")
add_player("phil-salt", "Phil Salt", "England", ["Modern"], [{"franchise": "DC", "eras": ["2022–Present"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Opener", ["Wicketkeeper"], 89, 25, "Right", "None", False, "Icon")
add_player("sam-curran", "Sam Curran", "England", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021", "2022–Present"]}, {"franchise": "CSK", "eras": ["2018–2021"]}], "Allrounder", ["Pacer"], 81, 86, "Left", "FastMedium", True, "Icon")
add_player("liam-livingstone", "Liam Livingstone", "England", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Allrounder", ["Finisher"], 88, 74, "Right", "LegSpin", False, "Icon")
add_player("jofra-archer", "Jofra Archer", "England", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2022–Present"]}], "Pacer", [], 55, 93, "Right", "Fast", False, "Legend")
add_player("noor-ahmad", "Noor Ahmad", "Afghanistan", ["Modern"], [{"franchise": "GT", "eras": ["2022–Present"]}], "Spinner", [], 40, 86, "Left", "LeftArmUnorthodox", False, "Pro")
add_player("fazalhaq-farooqi", "Fazalhaq Farooqi", "Afghanistan", ["Modern"], [{"franchise": "SRH", "eras": ["2022–Present"]}], "Pacer", [], 40, 85, "Left", "FastMedium", False, "Pro")
add_player("naveen-ul-haq", "Naveen-ul-Haq", "Afghanistan", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 40, 85, "Right", "FastMedium", False, "Pro")
add_player("tim-david", "Tim David", "Australia", ["Modern"], [{"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "MI", "eras": ["2022–Present"]}], "Finisher", [], 88, 50, "Right", "OffSpin", False, "Icon")
add_player("mitchell-marsh", "Mitchell Marsh", "Australia", ["2010s", "Modern"], [{"franchise": "DC", "eras": ["2008–2012", "2022–Present"]}, {"franchise": "SRH", "eras": ["2018–2021"]}], "Allrounder", ["TopOrder"], 87, 78, "Right", "FastMedium", True, "Icon")

# --- EXPANDED INTERNATIONAL NATIONS LEGENDS (HISTORICAL & PURE INTL) ---
# West Indies 1980s/1990s
add_player("viv-richards", "Viv Richards", "West Indies", ["1980s"], [], "TopOrder", ["Finisher"], 99, 68, "Right", "OffSpin", True, "Legend")
add_player("clive-lloyd", "Clive Lloyd", "West Indies", ["1980s"], [], "MiddleOrder", [], 92, 50, "Left", "Medium", True, "Legend")
add_player("malcolm-marshall", "Malcolm Marshall", "West Indies", ["1980s"], [], "Pacer", [], 65, 99, "Right", "Fast", False, "Legend")
add_player("joel-garner", "Joel Garner", "West Indies", ["1980s"], [], "Pacer", [], 45, 96, "Right", "Fast", False, "Legend")
add_player("michael-holding", "Michael Holding", "West Indies", ["1980s"], [], "Pacer", [], 48, 97, "Right", "Fast", False, "Legend")
add_player("andy-roberts", "Andy Roberts", "West Indies", ["1980s"], [], "Pacer", [], 45, 94, "Right", "Fast", False, "Legend")
add_player("gordon-greenidge", "Gordon Greenidge", "West Indies", ["1980s"], [], "Opener", [], 94, 25, "Right", "Medium", False, "Legend")
add_player("desmond-haynes", "Desmond Haynes", "West Indies", ["1980s", "1990s"], [], "Opener", [], 92, 35, "Right", "LegSpin", False, "Legend")
add_player("jeffrey-dujon", "Jeffrey Dujon", "West Indies", ["1980s", "1990s"], [], "Wicketkeeper", [], 84, 25, "Right", "None", False, "Icon")
add_player("brian-lara", "Brian Lara", "West Indies", ["1990s", "2000s"], [], "TopOrder", [], 99, 25, "Left", "LegSpin", True, "Legend")
add_player("curtly-ambrose", "Curtly Ambrose", "West Indies", ["1990s", "2000s"], [], "Pacer", [], 40, 98, "Right", "Fast", False, "Legend")
add_player("courtney-walsh", "Courtney Walsh", "West Indies", ["1980s", "1990s", "2000s"], [], "Pacer", [], 40, 96, "Right", "FastMedium", True, "Legend")
add_player("shivnarine-chanderpaul", "Shivnarine Chanderpaul", "West Indies", ["1990s", "2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}], "MiddleOrder", ["TopOrder"], 92, 35, "Left", "LegSpin", True, "Legend")
add_player("carl-hooper", "Carl Hooper", "West Indies", ["1980s", "1990s", "2000s"], [], "Allrounder", ["Spinner"], 84, 80, "Right", "OffSpin", True, "Icon")

# Pakistan 1980s/1990s/2000s/Modern
add_player("imran-khan", "Imran Khan", "Pakistan", ["1980s", "1990s"], [], "Allrounder", ["Pacer"], 89, 98, "Right", "Fast", True, "Legend")
add_player("javed-miandad", "Javed Miandad", "Pakistan", ["1980s", "1990s"], [], "TopOrder", ["MiddleOrder"], 94, 45, "Right", "LegSpin", True, "Legend")
add_player("wasim-akram", "Wasim Akram", "Pakistan", ["1980s", "1990s", "2000s"], [], "Pacer", ["Allrounder"], 74, 99, "Left", "Fast", True, "Legend")
add_player("waqar-younis", "Waqar Younis", "Pakistan", ["1990s", "2000s"], [], "Pacer", [], 45, 97, "Right", "Fast", True, "Legend")
add_player("inzamam-ul-haq", "Inzamam-ul-Haq", "Pakistan", ["1990s", "2000s"], [], "MiddleOrder", ["TopOrder"], 94, 30, "Right", "SlowLeftArm", True, "Legend")
add_player("saeed-anwar", "Saeed Anwar", "Pakistan", ["1990s", "2000s"], [], "Opener", [], 94, 40, "Left", "SlowLeftArm", False, "Legend")
add_player("saqlain-mushtaq", "Saqlain Mushtaq", "Pakistan", ["1990s", "2000s"], [], "Spinner", [], 40, 95, "Right", "OffSpin", False, "Legend")
add_player("shoaib-akhtar", "Shoaib Akhtar", "Pakistan", ["1990s", "2000s"], [{"franchise": "KKR", "eras": ["2008–2012"]}], "Pacer", [], 40, 97, "Right", "Fast", False, "Legend")
add_player("mohammad-yousuf", "Mohammad Yousuf", "Pakistan", ["1990s", "2000s"], [], "MiddleOrder", ["TopOrder"], 93, 25, "Right", "None", False, "Legend")
add_player("younis-khan", "Younis Khan", "Pakistan", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}], "TopOrder", [], 92, 35, "Right", "Medium", True, "Legend")
add_player("shahid-afridi", "Shahid Afridi", "Pakistan", ["1990s", "2000s", "2010s"], [{"franchise": "SRH", "eras": ["2008–2012"]}], "Allrounder", ["Spinner"], 86, 88, "Right", "LegSpin", True, "Legend")
add_player("abdul-qadir", "Abdul Qadir", "Pakistan", ["1980s", "1990s"], [], "Spinner", [], 48, 93, "Right", "LegSpin", False, "Legend")
add_player("moin-khan", "Moin Khan", "Pakistan", ["1990s", "2000s"], [], "Wicketkeeper", [], 78, 25, "Right", "None", True, "Icon")
add_player("babar-azam", "Babar Azam", "Pakistan", ["2010s", "Modern"], [], "TopOrder", ["Opener"], 95, 25, "Right", "OffSpin", True, "Legend")
add_player("shaheen-afridi", "Shaheen Afridi", "Pakistan", ["Modern"], [], "Pacer", [], 48, 95, "Left", "Fast", True, "Legend")
add_player("mohammad-rizwan", "Mohammad Rizwan", "Pakistan", ["Modern"], [], "Wicketkeeper", ["Opener"], 91, 25, "Right", "Medium", False, "Icon")
add_player("naseem-shah", "Naseem Shah", "Pakistan", ["Modern"], [], "Pacer", [], 42, 89, "Right", "Fast", False, "Icon")
add_player("shadab-khan", "Shadab Khan", "Pakistan", ["Modern"], [], "Allrounder", ["Spinner"], 82, 87, "Right", "LegSpin", True, "Icon")
add_player("haris-rauf", "Haris Rauf", "Pakistan", ["Modern"], [], "Pacer", [], 40, 88, "Right", "Fast", False, "Icon")
add_player("fakhar-zaman", "Fakhar Zaman", "Pakistan", ["2010s", "Modern"], [], "Opener", [], 88, 30, "Left", "SlowLeftArm", False, "Icon")

# Australia National Legends
add_player("allan-border", "Allan Border", "Australia", ["1980s", "1990s"], [], "MiddleOrder", ["Allrounder"], 93, 62, "Left", "LeftArmOrthodox", True, "Legend")
add_player("steve-waugh", "Steve Waugh", "Australia", ["1980s", "1990s", "2000s"], [], "MiddleOrder", ["Allrounder"], 94, 72, "Right", "Medium", True, "Legend")
add_player("mark-waugh", "Mark Waugh", "Australia", ["1990s", "2000s"], [], "TopOrder", ["Opener"], 91, 60, "Right", "OffSpin", False, "Legend")
add_player("ricky-ponting", "Ricky Ponting", "Australia", ["1990s", "2000s", "2010s"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "MI", "eras": ["2013–2017"]}], "TopOrder", [], 98, 35, "Right", "Medium", True, "Legend")
add_player("glenn-mcgrath", "Glenn McGrath", "Australia", ["1990s", "2000s"], [{"franchise": "DC", "eras": ["2008–2012"]}], "Pacer", [], 40, 99, "Right", "FastMedium", False, "Legend")
add_player("brett-lee", "Brett Lee", "Australia", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}], "Pacer", [], 55, 95, "Right", "Fast", False, "Legend")
add_player("jason-gillespie", "Jason Gillespie", "Australia", ["1990s", "2000s"], [], "Pacer", [], 55, 91, "Right", "Fast", False, "Legend")
add_player("michael-clarke", "Michael Clarke", "Australia", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}], "MiddleOrder", ["Spinner"], 92, 55, "Right", "LeftArmOrthodox", True, "Legend")
add_player("mitchell-johnson", "Mitchell Johnson", "Australia", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "KKR", "eras": ["2018–2021"]}], "Pacer", ["Allrounder"], 65, 94, "Left", "Fast", False, "Legend")
add_player("steve-smith", "Steve Smith", "Australia", ["2010s", "Modern"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021"]}], "TopOrder", [], 97, 45, "Right", "LegSpin", True, "Legend")
add_player("josh-hazlewood", "Josh Hazlewood", "Australia", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Pacer", [], 40, 92, "Right", "FastMedium", False, "Legend")
add_player("nathan-lyon", "Nathan Lyon", "Australia", ["2010s", "Modern"], [], "Spinner", [], 42, 92, "Right", "OffSpin", False, "Legend")
add_player("marnus-labuschagne", "Marnus Labuschagne", "Australia", ["Modern"], [], "TopOrder", [], 91, 55, "Right", "LegSpin", False, "Icon")
add_player("alex-carey", "Alex Carey", "Australia", ["Modern"], [{"franchise": "DC", "eras": ["2018–2021"]}], "Wicketkeeper", [], 84, 25, "Left", "None", False, "Pro")
add_player("cameron-green", "Cameron Green", "Australia", ["Modern"], [{"franchise": "MI", "eras": ["2022–Present"]}, {"franchise": "RCB", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 87, 83, "Right", "FastMedium", False, "Icon")

# England National Legends
add_player("ian-botham", "Ian Botham", "England", ["1980s", "1990s"], [], "Allrounder", ["Pacer"], 91, 95, "Right", "FastMedium", True, "Legend")
add_player("david-gower", "David Gower", "England", ["1980s", "1990s"], [], "TopOrder", [], 93, 30, "Left", "OffSpin", True, "Legend")
add_player("graham-gooch", "Graham Gooch", "England", ["1980s", "1990s"], [], "Opener", [], 94, 45, "Right", "Medium", True, "Legend")
add_player("alec-stewart", "Alec Stewart", "England", ["1990s", "2000s"], [], "Wicketkeeper", ["Opener"], 89, 25, "Right", "Medium", True, "Legend")
add_player("andrew-flintoff", "Andrew Flintoff", "England", ["1990s", "2000s"], [{"franchise": "CSK", "eras": ["2008–2012"]}], "Allrounder", ["Pacer"], 90, 91, "Right", "Fast", True, "Legend")
add_player("kevin-pietersen", "Kevin Pietersen", "England", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2013–2017"]}], "TopOrder", ["MiddleOrder"], 95, 52, "Right", "OffSpin", True, "Legend")
add_player("james-anderson", "James Anderson", "England", ["2000s", "2010s", "Modern"], [], "Pacer", [], 40, 97, "Right", "FastMedium", False, "Legend")
add_player("stuart-broad", "Stuart Broad", "England", ["2000s", "2010s", "Modern"], [{"franchise": "PK", "eras": ["2008–2012"]}], "Pacer", ["Allrounder"], 60, 93, "Left", "FastMedium", True, "Legend")
add_player("alastair-cook", "Alastair Cook", "England", ["2000s", "2010s"], [], "Opener", [], 94, 25, "Left", "SlowLeftArm", True, "Legend")
add_player("joe-root", "Joe Root", "England", ["2010s", "Modern"], [{"franchise": "RR", "eras": ["2022–Present"]}], "TopOrder", ["Spinner"], 96, 58, "Right", "OffSpin", True, "Legend")
add_player("ben-stokes", "Ben Stokes", "England", ["2010s", "Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "CSK", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 94, 88, "Left", "FastMedium", True, "Legend")
add_player("jonny-bairstow", "Jonny Bairstow", "England", ["2010s", "Modern"], [{"franchise": "SRH", "eras": ["2018–2021"]}, {"franchise": "PK", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 90, 25, "Right", "OffSpin", False, "Icon")
add_player("mark-wood", "Mark Wood", "England", ["Modern"], [{"franchise": "CSK", "eras": ["2018–2021"]}, {"franchise": "LSG", "eras": ["2022–Present"]}], "Pacer", [], 40, 91, "Right", "Fast", False, "Icon")
add_player("harry-brook", "Harry Brook", "England", ["Modern"], [{"franchise": "SRH", "eras": ["2022–Present"]}, {"franchise": "DC", "eras": ["2022–Present"]}], "MiddleOrder", [], 89, 40, "Right", "Medium", False, "Icon")

# South Africa National Legends
add_player("graeme-pollock", "Graeme Pollock", "South Africa", ["1980s"], [], "TopOrder", [], 97, 30, "Left", "LegSpin", False, "Legend")
add_player("allan-donald", "Allan Donald", "South Africa", ["1990s", "2000s"], [{"franchise": "RCB", "eras": []}], "Pacer", [], 40, 98, "Right", "Fast", False, "Legend")
add_player("jonty-rhodes", "Jonty Rhodes", "South Africa", ["1990s", "2000s"], [], "MiddleOrder", [], 89, 30, "Right", "Medium", False, "Legend")
add_player("shaun-pollock", "Shaun Pollock", "South Africa", ["1990s", "2000s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "Allrounder", ["Pacer"], 84, 96, "Right", "FastMedium", True, "Legend")
add_player("jacques-kallis", "Jacques Kallis", "South Africa", ["1990s", "2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012", "2013–2017"]}], "Allrounder", ["TopOrder"], 98, 92, "Right", "FastMedium", True, "Legend")
add_player("graeme-smith", "Graeme Smith", "South Africa", ["2000s", "2010s"], [{"franchise": "RR", "eras": ["2008–2012"]}], "Opener", [], 92, 35, "Left", "OffSpin", True, "Legend")
add_player("mark-boucher", "Mark Boucher", "South Africa", ["1990s", "2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "KKR", "eras": ["2008–2012"]}], "Wicketkeeper", [], 87, 25, "Right", "None", True, "Legend")
add_player("makhaya-ntini", "Makhaya Ntini", "South Africa", ["1990s", "2000s"], [{"franchise": "CSK", "eras": ["2008–2012"]}], "Pacer", [], 40, 91, "Right", "Fast", False, "Legend")
add_player("hashim-amla", "Hashim Amla", "South Africa", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2013–2017"]}], "TopOrder", ["Opener"], 94, 25, "Right", "OffSpin", True, "Legend")
add_player("vernon-philander", "Vernon Philander", "South Africa", ["2000s", "2010s"], [], "Pacer", ["Allrounder"], 65, 92, "Right", "FastMedium", False, "Icon")
add_player("keshav-maharaj", "Keshav Maharaj", "South Africa", ["Modern"], [{"franchise": "LSG", "eras": ["2022–Present"]}], "Spinner", [], 55, 89, "Right", "LeftArmOrthodox", True, "Icon")
add_player("aiden-markram", "Aiden Markram", "South Africa", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "TopOrder", ["OffSpin"], 89, 65, "Right", "OffSpin", True, "Icon")
add_player("anrich-nortje", "Anrich Nortje", "South Africa", ["Modern"], [{"franchise": "KKR", "eras": ["2018–2021"]}, {"franchise": "DC", "eras": ["2018–2021", "2022–Present"]}], "Pacer", [], 40, 92, "Right", "Fast", False, "Icon")

# New Zealand National Legends
add_player("richard-hadlee", "Richard Hadlee", "New Zealand", ["1980s"], [], "Allrounder", ["Pacer"], 86, 99, "Left", "Fast", True, "Legend")
add_player("martin-crowe", "Martin Crowe", "New Zealand", ["1980s", "1990s"], [], "TopOrder", [], 94, 45, "Right", "Medium", True, "Legend")
add_player("stephen-fleming", "Stephen Fleming", "New Zealand", ["1990s", "2000s"], [{"franchise": "CSK", "eras": ["2008–2012"]}], "Opener", ["TopOrder"], 90, 25, "Left", "None", True, "Legend")
add_player("nathan-astle", "Nathan Astle", "New Zealand", ["1990s", "2000s"], [], "Opener", ["Allrounder"], 88, 62, "Right", "Medium", False, "Legend")
add_player("daniel-vettori", "Daniel Vettori", "New Zealand", ["1990s", "2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}], "Spinner", ["Allrounder"], 74, 94, "Left", "LeftArmOrthodox", True, "Legend")
add_player("shane-bond", "Shane Bond", "New Zealand", ["2000s"], [{"franchise": "KKR", "eras": ["2008–2012"]}], "Pacer", [], 40, 96, "Right", "Fast", False, "Legend")
add_player("ross-taylor", "Ross Taylor", "New Zealand", ["2000s", "2010s"], [{"franchise": "RCB", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "MiddleOrder", [], 92, 30, "Right", "OffSpin", True, "Legend")
add_player("tim-southee", "Tim Southee", "New Zealand", ["2000s", "2010s", "Modern"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "RR", "eras": ["2013–2017"]}, {"franchise": "MI", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "RCB", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Pacer", ["Allrounder"], 65, 90, "Right", "FastMedium", True, "Icon")
add_player("martin-guptill", "Martin Guptill", "New Zealand", ["2000s", "2010s"], [{"franchise": "MI", "eras": ["2013–2017"]}, {"franchise": "PK", "eras": ["2013–2017"]}, {"franchise": "SRH", "eras": ["2018–2021"]}], "Opener", [], 89, 25, "Right", "OffSpin", False, "Icon")
add_player("daryl-mitchell", "Daryl Mitchell", "New Zealand", ["Modern"], [{"franchise": "RR", "eras": ["2022–Present"]}, {"franchise": "CSK", "eras": ["2022–Present"]}], "Allrounder", ["MiddleOrder"], 88, 70, "Right", "Medium", False, "Icon")
add_player("glenn-phillips", "Glenn Phillips", "New Zealand", ["Modern"], [{"franchise": "RR", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2022–Present"]}], "Finisher", ["Wicketkeeper"], 88, 55, "Right", "OffSpin", False, "Icon")
add_player("mitchell-santner", "Mitchell Santner", "New Zealand", ["2010s", "Modern"], [{"franchise": "CSK", "eras": ["2018–2021", "2022–Present"]}], "Spinner", ["Allrounder"], 70, 89, "Left", "LeftArmOrthodox", True, "Icon")

# Sri Lanka National Legends
add_player("aravinda-de-silva", "Aravinda de Silva", "Sri Lanka", ["1980s", "1990s", "2000s"], [], "MiddleOrder", ["Allrounder"], 95, 68, "Right", "OffSpin", True, "Legend")
add_player("arjuna-ranatunga", "Arjuna Ranatunga", "Sri Lanka", ["1980s", "1990s"], [], "MiddleOrder", [], 88, 50, "Left", "Medium", True, "Legend")
add_player("sanath-jayasuriya", "Sanath Jayasuriya", "Sri Lanka", ["1980s", "1990s", "2000s"], [{"franchise": "MI", "eras": ["2008–2012"]}], "Opener", ["Allrounder", "Spinner"], 95, 82, "Left", "LeftArmOrthodox", True, "Legend")
add_player("muttiah-muralitharan", "Muttiah Muralitharan", "Sri Lanka", ["1990s", "2000s", "2010s"], [{"franchise": "CSK", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}], "Spinner", [], 40, 99, "Right", "OffSpin", False, "Legend")
add_player("chaminda-vaas", "Chaminda Vaas", "Sri Lanka", ["1990s", "2000s"], [{"franchise": "SRH", "eras": ["2008–2012"]}], "Pacer", ["Allrounder"], 65, 92, "Left", "FastMedium", False, "Legend")
add_player("kumar-sangakkara", "Kumar Sangakkara", "Sri Lanka", ["2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "SRH", "eras": ["2008–2012", "2013–2017"]}], "Wicketkeeper", ["TopOrder"], 98, 25, "Left", "OffSpin", True, "Legend")
add_player("mahela-jayawardene", "Mahela Jayawardene", "Sri Lanka", ["1990s", "2000s", "2010s"], [{"franchise": "PK", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "TopOrder", ["MiddleOrder"], 95, 30, "Right", "Medium", True, "Legend")
add_player("tillakaratne-dilshan", "Tillakaratne Dilshan", "Sri Lanka", ["1990s", "2000s", "2010s"], [{"franchise": "DC", "eras": ["2008–2012"]}, {"franchise": "RCB", "eras": ["2008–2012", "2013–2017"]}], "Opener", ["Allrounder"], 91, 74, "Right", "OffSpin", True, "Legend")
add_player("angelo-mathews", "Angelo Mathews", "Sri Lanka", ["2000s", "2010s", "Modern"], [{"franchise": "KKR", "eras": ["2008–2012"]}, {"franchise": "DC", "eras": ["2013–2017"]}], "Allrounder", ["MiddleOrder"], 87, 81, "Right", "Medium", True, "Icon")
add_player("rangana-herath", "Rangana Herath", "Sri Lanka", ["1990s", "2000s", "2010s"], [], "Spinner", [], 40, 93, "Left", "LeftArmOrthodox", True, "Legend")
add_player("maheesh-theekshana", "Maheesh Theekshana", "Sri Lanka", ["Modern"], [{"franchise": "CSK", "eras": ["2022–Present"]}], "Spinner", [], 40, 88, "Right", "OffSpin", False, "Pro")
add_player("pathum-nissanka", "Pathum Nissanka", "Sri Lanka", ["Modern"], [], "Opener", [], 87, 25, "Right", "None", False, "Pro")

# Bangladesh National Legends
add_player("mashrafe-mortaza", "Mashrafe Mortaza", "Bangladesh", ["2000s", "2010s"], [{"franchise": "KKR", "eras": ["2008–2012"]}], "Pacer", ["Allrounder"], 60, 85, "Right", "FastMedium", True, "Legend")
add_player("tamim-iqbal", "Tamim Iqbal", "Bangladesh", ["2000s", "2010s"], [], "Opener", [], 88, 25, "Left", "OffSpin", True, "Legend")
add_player("mushfiqur-rahim", "Mushfiqur Rahim", "Bangladesh", ["2000s", "2010s"], [], "Wicketkeeper", ["MiddleOrder"], 86, 25, "Right", "None", True, "Icon")
add_player("mahmudullah", "Mahmudullah", "Bangladesh", ["2000s", "2010s", "Modern"], [], "Allrounder", ["Finisher"], 84, 76, "Right", "OffSpin", True, "Icon")
add_player("liton-das", "Liton Das", "Bangladesh", ["2010s", "Modern"], [{"franchise": "KKR", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 85, 25, "Right", "None", True, "Pro")
add_player("taskin-ahmed", "Taskin Ahmed", "Bangladesh", ["2010s", "Modern"], [], "Pacer", [], 40, 86, "Right", "Fast", False, "Icon")
add_player("mehidy-hasan-miraz", "Mehidy Hasan Miraz", "Bangladesh", ["2010s", "Modern"], [], "Allrounder", ["Spinner"], 78, 87, "Right", "OffSpin", True, "Icon")
add_player("najmul-hossain-shanto", "Najmul Hossain Shanto", "Bangladesh", ["Modern"], [], "TopOrder", [], 84, 30, "Left", "OffSpin", True, "Pro")

# Afghanistan National Legends
add_player("mohammad-nabi", "Mohammad Nabi", "Afghanistan", ["2000s", "2010s", "Modern"], [{"franchise": "SRH", "eras": ["2013–2017", "2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}, {"franchise": "MI", "eras": ["2022–Present"]}], "Allrounder", ["Spinner"], 86, 88, "Right", "OffSpin", True, "Legend")
add_player("asghar-afghan", "Asghar Afghan", "Afghanistan", ["2000s", "2010s"], [], "MiddleOrder", [], 81, 40, "Right", "OffSpin", True, "Icon")
add_player("mujeeb-ur-rahman", "Mujeeb Ur Rahman", "Afghanistan", ["Modern"], [{"franchise": "PK", "eras": ["2018–2021"]}, {"franchise": "SRH", "eras": ["2018–2021"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Spinner", [], 40, 89, "Right", "OffSpin", False, "Icon")
add_player("ibrahim-zadran", "Ibrahim Zadran", "Afghanistan", ["Modern"], [], "Opener", [], 86, 30, "Right", "Medium", False, "Icon")
add_player("rahmanullah-gurbaz", "Rahmanullah Gurbaz", "Afghanistan", ["Modern"], [{"franchise": "GT", "eras": ["2022–Present"]}, {"franchise": "KKR", "eras": ["2022–Present"]}], "Wicketkeeper", ["Opener"], 87, 25, "Right", "None", False, "Icon")
add_player("azmatullah-omarzai", "Azmatullah Omarzai", "Afghanistan", ["Modern"], [{"franchise": "GT", "eras": ["2022–Present"]}], "Allrounder", ["Pacer"], 84, 84, "Right", "Medium", False, "Icon")

# Write out players list
output_path = "/home/naveen/Projects/stumpd/src/data/players.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(players, f, indent=2)

print(f"Successfully generated {len(players)} verified cricketers into {output_path}")
