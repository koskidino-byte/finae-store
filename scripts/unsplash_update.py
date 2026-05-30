import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# High quality, relevant Unsplash images for each product
UPDATES = {
    "finae-1":  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",  # percale sheets
    "finae-2":  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",  # linen sheets
    "finae-3":  "https://images.unsplash.com/photo-1606944416490-c39a10c90bb5?w=800&q=80",  # plush towels
    "finae-4":  "https://images.unsplash.com/photo-1620626011761-996317702a8b?w=800&q=80",  # quickdry towels
    "finae-5":  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",  # turkish towels
    "finae-6":  "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",  # crew socks
    "finae-7":  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",  # merino socks
    "finae-8":  "https://images.unsplash.com/photo-1592789705501-f9ae4278a9c9?w=800&q=80",  # cloud pillowcase
    "finae-9":  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80",  # percale pillowcase
    "finae-10": "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",  # linen pillowcase
    "finae-11": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",    # lounge socks
    "finae-12": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",  # sateen sheets
}

# Get real IDs
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
            print("OK:", ext_id); ok += 1
    except urllib.error.HTTPError as e:
        print("GRESKA", ext_id, e.code, e.read().decode()[:80])

print("\nGotovo!", ok, "/ 12 azurirano.")
