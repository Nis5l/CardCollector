import json
import mysql.connector
from mysql.connector import Error
from urllib.parse import urlparse
import os
import hashlib
import shutil

with open("../../Config.json", "r") as f:
    config = json.load(f)

url = urlparse(config["db_connection"])

STATIC_DIR = "../../static/card"
MEDIA_DIR = "../../media/originals"

try:
    connection = mysql.connector.connect(
        host=url.hostname,
        port=url.port,
        user=url.username,
        password=url.password,
        database=url.path.lstrip('/'),  # remove leading '/'
        ssl_disabled=True if "ssl-mode=DISABLED" in url.query else False
    )

    if connection.is_connected():
        print("Connected to database")
        cursor = connection.cursor()

        cursor.execute("SELECT cid FROM cards")
        cids = [row[0] for row in cursor.fetchall()]

        for cid in cids:
            src_file = os.path.join(STATIC_DIR, str(cid), "card-image")
            if os.path.isfile(src_file):
                # Compute SHA-256
                with open(src_file, "rb") as f:
                    file_bytes = f.read()
                    sha256_hash = hashlib.sha256(file_bytes).hexdigest()

                dest_file = os.path.join(MEDIA_DIR, f"{sha256_hash}.bin")

                # Move file
                shutil.move(src_file, dest_file)
                print(f"Moved {src_file} -> {dest_file}")

                # Update DB
                cursor.execute(
                    "UPDATE cards SET cimage=%s WHERE cid=%s",
                    (sha256_hash, cid)
                )
                connection.commit()

except mysql.connector.Error as e:
    print(f"Error connecting: {e}")

finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
        print("Connection closed")
