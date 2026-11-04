#!/usr/bin/env python3
"""
Comprehensive authentic cricket roster generator for Stumpd.
Populates src/data/players.json with 500+ real, verified international & IPL cricketers.
Strict separation of internationalEras ('1980s', '1990s', '2000s', '2010s', 'Modern')
and iplCareers ({ franchise, eras: ['2008–2012', '2013–2017', '2018–2021', '2022–Present'] }).
"""

import json
import os

players = []
seen_ids = set()

def add(id, name, country, intl_eras, ipl_careers, role, sec_roles, bat, bowl, hand, b_type, is_c=False, rarity='Icon'):
    if id in seen_ids:
        raise ValueError(f"Duplicate player ID: {id}")
    seen_ids.add(id)
    
    # Backwards compatibility fields
    eras = list(intl_eras)
    franchises = list({c['franchise'] for c in ipl_careers}) if ipl_careers else []
    
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
        "battingRating": max(40, min(99, int(bat))),
        "bowlingRating": max(20, min(99, int(bowl))),
        "battingHand": hand,
        "bowlingType": b_type,
        "isCaptainCandidate": is_c,
        "rarity": rarity
    })

print("Helper defined, starting player data loading...")
