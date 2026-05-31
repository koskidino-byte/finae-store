import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# Premium, product-specific Unsplash images
UPDATES = {
    # Sheets - clean white/linen bedroom shots
    "finae-1":  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",  # white percale bed
    "finae-2":  "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80",  # linen textured sheets
    # Towels - spa/bathroom
    "finae-3":  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",  # plush white towels stacked
    "finae-4":  "https://images.unsplash.com/photo-1600369671854-7d81e02f9e7f?w=800&q=80",  # folded bath towels
    "finae-5":  "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80",  # turkish towel spa
    # Socks - lifestyle/cozy
    "finae-6":  "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=800&q=80",  # white crew socks
    "finae-7":  "https://images.unsplash.com/photo-1617093827884-e90e72f2a76a?w=800&q=80",  # wool socks cozy
    "finae-11": "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=800&q=80",  # lounge socks cozy
    # Pillowcases - clean pillow shots
    "finae-8":  "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",  # white fluffy pillows
    "finae-9":  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",  # crisp percale pillow
    "finae-10": "https://images.unsplash.com/photo-1597599397395-f36df7bc6a3f?w=800&q=80",  # linen pillowcase
    # Luxury sheets
    "finae-12": "https://images.unsplash.com/photo-1649421828928-39d95dc3c8df?w=800&q=80",  # sateen luxury bed
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
