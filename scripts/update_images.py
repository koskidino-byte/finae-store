import urllib.request
import json

API_KEY = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

updates = [
    ("finae-1", f"{BASE}/pillowcase-cloud.png"),      # Classic Percale Sheet Set
    ("finae-2", f"{BASE}/sheets-linen.png"),           # Stonewashed Linen Sheet Set
    ("finae-3", f"{BASE}/towel-plush.png"),            # Plush Bath Towel Set
    ("finae-4", f"{BASE}/towel-quickdry.png"),         # Quick-Dry Bath Towels
    ("finae-5", f"{BASE}/towel-turkish.png"),          # Spa Turkish Towels
    ("finae-6", f"{BASE}/socks-crew.png"),             # Classic Crew Socks 3-Pack
    ("finae-7", f"{BASE}/socks-crew.png"),             # Merino Wool Socks 2-Pack
    ("finae-8", f"{BASE}/pillowcase-cloud.png"),       # Cloud Nine Pillowcase Set
    ("finae-9", f"{BASE}/pillowcase-linen.png"),       # Everyday Percale Pillowcase Pair
    ("finae-10", f"{BASE}/pillowcase-linen.png"),      # Linen Blend Pillowcase Set
    ("finae-11", f"{BASE}/socks-crew.png"),            # Cozy Lounge Socks
    ("finae-12", f"{BASE}/sheets-sateen.png"),         # Luxe Sateen Sheet Set
]

for ext_id, image_url in updates:
    item_id = f"$custom:::{ext_id}"
    encoded_id = item_id.replace("$", "%24").replace(":", "%3A")
    url = f"https://a.klaviyo.com/api/catalog-items/{encoded_id}/"
    data = json.dumps({"data": {"type": "catalog-item", "id": item_id, "attributes": {
        "image_full_url": image_url
    }}}).encode()
    req = urllib.request.Request(url, data=data, method="PATCH",
        headers={"Authorization": f"Klaviyo-API-Key {API_KEY}",
                 "revision": "2024-02-15", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            print(f"OK: {ext_id}")
    except Exception as e:
        print(f"Greska {ext_id}: {e}")
