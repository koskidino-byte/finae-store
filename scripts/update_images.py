import urllib.request
import urllib.error
import json

API_KEY = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

updates = [
    ("finae-1", f"{BASE}/pillowcase-cloud.png"),
    ("finae-2", f"{BASE}/sheets-linen.png"),
    ("finae-3", f"{BASE}/towel-plush.png"),
    ("finae-4", f"{BASE}/towel-quickdry.png"),
    ("finae-5", f"{BASE}/towel-turkish.png"),
    ("finae-6", f"{BASE}/socks-crew.png"),
    ("finae-7", f"{BASE}/socks-crew.png"),
    ("finae-8", f"{BASE}/pillowcase-cloud.png"),
    ("finae-9", f"{BASE}/pillowcase-linen.png"),
    ("finae-10", f"{BASE}/pillowcase-linen.png"),
    ("finae-11", f"{BASE}/socks-crew.png"),
    ("finae-12", f"{BASE}/sheets-sateen.png"),
]

for ext_id, image_url in updates:
    # First get the item to find its real ID
    search_url = f"https://a.klaviyo.com/api/catalog-items/?filter=equals(external_id,\"{ext_id}\")"
    req = urllib.request.Request(search_url,
        headers={"Authorization": f"Klaviyo-API-Key {API_KEY}",
                 "revision": "2024-02-15"})
    try:
        with urllib.request.urlopen(req) as r:
            result = json.loads(r.read())
            items = result.get("data", [])
            if not items:
                print(f"Not found: {ext_id}")
                continue
            real_id = items[0]["id"]
            
        # Now update with real ID
        update_url = f"https://a.klaviyo.com/api/catalog-items/{urllib.request.quote(real_id, safe='')}/"
        data = json.dumps({"data": {"type": "catalog-item", "id": real_id, "attributes": {
            "image_full_url": image_url
        }}}).encode()
        req2 = urllib.request.Request(update_url, data=data, method="PATCH",
            headers={"Authorization": f"Klaviyo-API-Key {API_KEY}",
                     "revision": "2024-02-15", "Content-Type": "application/json"})
        with urllib.request.urlopen(req2) as r2:
            print(f"OK: {ext_id} -> {real_id}")
    except urllib.error.HTTPError as e:
        print(f"Greska {ext_id}: {e.code} {e.read().decode()[:100]}")
    except Exception as e:
        print(f"Greska {ext_id}: {e}")
