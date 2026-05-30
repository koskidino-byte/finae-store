import urllib.request
import json

API_KEY = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
BASE_URL = "https://02281622-b839-486f-8cf6-ee32e50bd821-00-2hf1fd36gxnp6.kirk.replit.dev"

updates = [
    ("finae-8", "pillowcase-cloud.png"),
    ("finae-2", "sheets-linen.png"),
    ("finae-3", "towel-plush.png"),
]

for ext_id, img_file in updates:
    item_id = f"$custom:::{ext_id}"
    encoded_id = item_id.replace("$", "%24").replace(":", "%3A")
    url = f"https://a.klaviyo.com/api/catalog-items/{encoded_id}/"
    data = json.dumps({"data": {"type": "catalog-item", "id": item_id, "attributes": {
        "image_full_url": f"{BASE_URL}/products/{img_file}"
    }}}).encode()
    req = urllib.request.Request(url, data=data, method="PATCH",
        headers={"Authorization": f"Klaviyo-API-Key {API_KEY}",
                 "revision": "2024-02-15", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            print(f"OK: {ext_id} -> {img_file}")
    except Exception as e:
        print(f"Greska {ext_id}: {e}")
