import urllib.request, urllib.parse, json, base64, time, hashlib, hmac

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

# Cloudinary free account
CLOUD_NAME = "demofinaestore"
UPLOAD_PRESET = "ml_default"

# Get all Klaviyo items
r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
all_items = {it["attributes"].get("external_id"): it["id"] for it in json.loads(r.read())["data"]}
print("Ucitano", len(all_items), "proizvoda\n")

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
    print("Upload:", fname)
    # Upload to Cloudinary via URL (no binary needed)
    gh_url = BASE + "/" + fname
    try:
        upload_data = urllib.parse.urlencode({
            "file": gh_url,
            "upload_preset": UPLOAD_PRESET,
            "public_id": "finae/" + fname.replace(".png","")
        }).encode()
        req = urllib.request.Request(
            "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload",
            data=upload_data)
        res = json.loads(urllib.request.urlopen(req).read())
        img_url = res["secure_url"]
        print("  Cloudinary OK:", img_url[:60])
    except Exception as e:
        print("  Cloudinary GRESKA:", str(e)[:100])
        # Fallback: use GitHub URL directly (some Klaviyo accounts accept it)
        img_url = gh_url
        print("  Koristim GitHub URL kao fallback")

    for ext_id in ext_ids:
        real_id = all_items.get(ext_id)
        if not real_id:
            print("  nije pronadjen:", ext_id); continue
        try:
            payload = json.dumps({
                "data": {"type":"catalog-item","id":real_id,
                         "attributes":{"image_full_url": img_url}}
            }).encode()
            req2 = urllib.request.Request(
                "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id,safe="") + "/",
                data=payload, method="PATCH",
                headers={"Authorization":"Klaviyo-API-Key "+API,
                         "revision":"2024-02-15","Content-Type":"application/json"})
            with urllib.request.urlopen(req2):
                print("  Klaviyo OK:", ext_id); ok += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print("  GRESKA", ext_id, e.code, body[:120])
    time.sleep(1)

print("\nGotovo!", ok, "/ 12 azurirano.")
