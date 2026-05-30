import urllib.request, urllib.parse, json, base64, time

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
IMGUR_CLIENT = "546c25a59c58ad7"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

# Get all items first to find real IDs
r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
all_items = {it["attributes"].get("external_id"): it["id"] for it in json.loads(r.read())["data"]}
print("Ucitano", len(all_items), "proizvoda iz Klaviyo\n")

# Image map: filename -> list of external_ids
FILES = [
    ("sheets-linen.png",    ["finae-1", "finae-2"]),
    ("towel-plush.png",     ["finae-3"]),
    ("towel-quickdry.png",  ["finae-4"]),
    ("towel-turkish.png",   ["finae-5"]),
    ("socks-crew.png",      ["finae-6", "finae-7", "finae-11"]),
    ("pillowcase-cloud.png",["finae-8"]),
    ("pillowcase-linen.png",["finae-9", "finae-10"]),
    ("sheets-sateen.png",   ["finae-12"]),
]

ok = 0
for fname, ext_ids in FILES:
    print("Uploadam na Imgur:", fname)
    # Upload to Imgur
    img_url = None
    for attempt in range(4):
        try:
            raw = urllib.request.urlopen(BASE + "/" + fname).read()
            b64 = base64.b64encode(raw).decode()
            req = urllib.request.Request(
                "https://api.imgur.com/3/image",
                data=urllib.parse.urlencode({"image": b64, "type": "base64"}).encode(),
                headers={"Authorization": "Client-ID " + IMGUR_CLIENT})
            res = json.loads(urllib.request.urlopen(req).read())
            img_url = res["data"]["link"]
            print("  Imgur OK:", img_url)
            break
        except Exception as e:
            print("  Pokusaj", attempt+1, "neuspjesan:", str(e)[:60])
            time.sleep(6)
    
    if not img_url:
        print("  PRESKACAM - imgur nije uspio\n")
        continue

    # Update each product with this image
    for ext_id in ext_ids:
        real_id = all_items.get(ext_id)
        if not real_id:
            print("  nije pronadjen:", ext_id)
            continue
        try:
            payload = json.dumps({
                "data": {
                    "type": "catalog-item",
                    "id": real_id,
                    "attributes": {"image_full_url": img_url}
                }
            }).encode()
            encoded = urllib.parse.quote(real_id, safe="")
            req2 = urllib.request.Request(
                "https://a.klaviyo.com/api/catalog-items/" + encoded + "/",
                data=payload, method="PATCH",
                headers={
                    "Authorization": "Klaviyo-API-Key " + API,
                    "revision": "2024-02-15",
                    "Content-Type": "application/json"
                })
            with urllib.request.urlopen(req2) as resp:
                print("  Klaviyo OK:", ext_id)
                ok += 1
        except urllib.error.HTTPError as e:
            print("  GRESKA", ext_id, e.code, e.read().decode()[:100])
        except Exception as e:
            print("  GRESKA", ext_id, str(e))
    
    time.sleep(3)

print("\nGotovo!", ok, "/ 12 azurirano.")
