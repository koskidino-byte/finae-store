import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# Dark background, studio luxury product shots matching FINAE aesthetic
UPDATES = {
    # Sheets - dark/moody bedroom or folded fabric on dark bg
    "finae-1":  "https://images.unsplash.com/photo-1600369672770-985fd30004fd?w=800&q=80",  # dark folded sheets
    "finae-2":  "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80",  # linen dark tones
    # Towels - white on dark/minimal background
    "finae-3":  "https://images.unsplash.com/photo-1600369671236-cf3be46c0ca8?w=800&q=80",  # white towel dark bg
    "finae-4":  "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80",  # towel rolled dark
    "finae-5":  "https://images.unsplash.com/photo-1600369671610-b29a92f81e00?w=800&q=80",  # turkish towel dark
    # Socks - clean studio on dark
    "finae-6":  "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80",  # white socks dark
    "finae-7":  "https://images.unsplash.com/photo-1608256246200-c7e64b0a3909?w=800&q=80",  # wool socks dark
    "finae-11": "https://images.unsplash.com/photo-1587302912306-cf1ed9c33146?w=800&q=80",  # lounge socks dark
    # Pillowcases - dark moody pillow shots
    "finae-8":  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",  # dark pillow
    "finae-9":  "https://images.unsplash.com/photo-1600369672770-985fd30004fd?w=800&q=80",  # crisp pillow dark
    "finae-10": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80",  # linen pillow dark
    # Sateen - luxury dark bedroom
    "finae-12": "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80",  # sateen dark luxury
}

r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
id_map = {it["attributes"].get("external_id"): it["id"] for it in json.loads(r.read())["data"]}

ok = 0
for ext_id, img_url in UPDATES.items():
    real_id = id_map.get(ext_id)
    if not real_id:
        print("nije pronadjen:", ext_id); continue
    try:
        payload = json.dumps({"data":{"type":"catalog-item","id":real_id,"attributes":{"image_full_url":img_url}}}).encode()
        req = urllib.request.Request(
            "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id,safe="") + "/",
            data=payload, method="PATCH",
            headers={"Authorization":"Klaviyo-API-Key "+API,"revision":"2024-02-15","Content-Type":"application/json"})
        with urllib.request.urlopen(req):
            print("OK:", ext_id); ok += 1
    except urllib.error.HTTPError as e:
        print("GRESKA", ext_id, e.code, e.read().decode()[:80])

print("\nGotovo!", ok, "/ 12 azurirano.")
