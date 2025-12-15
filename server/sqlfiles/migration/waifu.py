import re
import random
import string
import os
import shutil

# Hardcoded values
COID = "lah63h4eu3hqc"
UID = "yjtlcxefcowxb"
CTSTATE = 1
CSTATE = 1

CARD_FOLDER = "card"
OLD_IMAGES_FOLDER = "old_card"  # folder where old .webp files live

def generate_random_id(length=13):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# Ensure output folder exists
os.makedirs(CARD_FOLDER, exist_ok=True)

# --- Process cardtypes ---
with open("cardtypes.sql", "r", encoding="utf-8") as f:
    cardtypes_sql = f.read()

cardtypes = {}
for match in re.finditer(r"\(\s*['\"]?(\d+)['\"]?\s*,\s*['\"](.+?)['\"]\s*\)", cardtypes_sql):
    old_id, name = match.groups()
    cardtypes[old_id] = name

new_cardtypes_ids = {old_id: generate_random_id() for old_id in cardtypes}

with open("new_cardtypes.sql", "w", encoding="utf-8") as f:
    f.write("INSERT INTO cardtypes (ctid, coid, uid, ctname, ctstate) VALUES\n")
    lines = []
    for old_id, name in cardtypes.items():
        new_id = new_cardtypes_ids[old_id]
        lines.append(f"('{new_id}', '{COID}', '{UID}', '{name}', {CTSTATE})")
    f.write(",\n".join(lines) + ";\n")

# --- Process cards ---
with open("cards.sql", "r", encoding="utf-8") as f:
    cards_sql = f.read()

cards = []
for match in re.finditer(r"\(\s*(\d+)\s*,\s*['\"](.+?)['\"]\s*,\s*(\d+)\s*,\s*['\"](.+?)['\"]\s*\)", cards_sql):
    cid, cname, old_ctid, cimage = match.groups()
    cards.append((cid, cname, old_ctid, cimage))

with open("new_cards.sql", "w", encoding="utf-8") as f:
    f.write("INSERT INTO cards (cid, cname, ctid, uid, cstate) VALUES\n")
    lines = []
    for _, cname, old_ctid, cimage in cards:
        new_ctid = new_cardtypes_ids[old_ctid]
        new_cid = generate_random_id()
        lines.append(f"('{new_cid}', '{cname}', '{new_ctid}', '{UID}', {CSTATE})")

        # Create folder for this card
        card_path = os.path.join(CARD_FOLDER, new_cid)
        os.makedirs(card_path, exist_ok=True)

        # Copy old .webp file to card-image
        src_image = os.path.join(OLD_IMAGES_FOLDER, cimage)
        dst_image = os.path.join(card_path, "card-image")
        if os.path.exists(src_image):
            shutil.copy(src_image, dst_image)
        else:
            print(f"⚠️ Warning: image file {cimage} not found for cid {new_cid}")

    f.write(",\n".join(lines) + ";\n")

print("✅ new_cardtypes.sql, new_cards.sql created and card images copied.")
