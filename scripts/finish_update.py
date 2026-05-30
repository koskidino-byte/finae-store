import urllib.request, urllib.parse, json, base64, time

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
CLOUD_NAME = "demofinaestore"
UPLOAD_PRESET = "ml_default"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

# Get current state from Klaviyo
r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
items = json.loads(r.read())["data"]
id_map = {it["attributes"].get("external_id"): it["id"] for it in items}

# Find which ones still have old unsplash/no proper image
needs_update = []
for it in items:
    ext_id = it["attributes"].get("external_id", "")
    img = it["attributes"].get("image_full_url", "")
    if "unsplash" in img or not img:
        needs_update.append(ext_id)
        print("Treba update:", ext_id, "|", img[:50])

if not needs_update:
    print("Svi su vec azurirani!")
    exit()

# Map ext_id -> filename
IMG_MAP = {
    "finae-1": "sheets-linen.png",
    "finae-2": "sheets-linen.png",
    "finae-3": "towel-plush.png",
    "finae-4": "towel-quickdry.png",
    "finae-5": "towel-turkish.png",
    "finae-6": "socks-crew.png",
    "finae-7": "socks-crew.png",
    "finae-8": "pillowcase-cloud.png",
    "finae-9": "pillowcase-linen.png",
    "finae-10": "pillowcase-linen.png",
    "finae-11": "socks-crew.png",
    "finae-12": "sheets-sateen.png",
}

# Upload each needed file to Cloudinary, then update Klaviyo
uploaded = {}
ok = 0

for ext_id in needs_update:
    fname = IMG_MAP.get(ext_id)
    if not fname:
        continue
    
    # Reuse already-uploaded URL if same filename
    if fname in uploaded:
        img_url = uploaded[fname]
    else:
        print("\nUploadam:", fname)
        img_url = None
        for attempt in range(5):
            try:
                upload_data = urllib.parse.urlencode({
                    "file": BASE + "/" + fname,
                    "upload_preset": UPLOAD_PRESET,
                    "public_id": "finae/" + fname.replace(".png","") + str(attempt)
                }).encode()
                res = json.loads(urllib.request.urlopen(urllib.request.Request(
                    "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload",
                    data=upload_data)).read())
                img_url = res["secure_url"]
                uploaded[fname] = img_url
                print("  OK:", img_url[:70])
                break
            except Exception as e:
                print("  Pokusaj", attempt+1, ":", str(e)[:60])
                time.sleep(4)
        
        if not img_url:
            print("  PRESKACAM - upload neuspjesan")
            continue
    
    # PATCH Klaviyo
    real_id = id_map.get(ext_id)
    if not real_id:
        print("  nije pronadjen:", ext_id); continue
    try:
        payload = json.dumps({
            "data": {"type":"catalog-item","id":real_id,
                     "attributes":{"image_full_url": img_url}}
        }).encode()
        req = urllib.request.Request(
            "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id,safe="") + "/",
            data=payload, method="PATCH",
            headers={"Authorization":"Klaviyo-API-Key "+API,
                     "revision":"2024-02-15","Content-Type":"application/json"})
        with urllib.request.urlopen(req):
            print("  Klaviyo OK:", ext_id); ok += 1
    except urllib.error.HTTPError as e:
        print("  GRESKA", ext_id, e.code, e.read().decode()[:100])

print("\nGotovo!", ok, "dodatno azurirano.")
