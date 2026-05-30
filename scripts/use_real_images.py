import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
B = "https://02281622-b839-486f-8cf6-ee32e50bd821-00-2hf1fd36gxnp6.kirk.replit.dev/products"

# Using exact filenames from the FINAE site
UPDATES = {
    "finae-1":  B + "/sheets-percale.png",
    "finae-2":  B + "/sheets-linen.png",
    "finae-3":  B + "/towel-plush.png",
    "finae-4":  B + "/towel-quickdry.png",
    "finae-5":  B + "/towel-turkish.png",
    "finae-6":  B + "/socks-crew.png",
    "finae-7":  B + "/socks-merino.png",
    "finae-8":  B + "/pillowcase-cloud.png",
    "finae-9":  B + "/pillowcase-percale.png",
    "finae-10": B + "/pillowcase-linen.png",
    "finae-11": B + "/socks-lounge.png",
    "finae-12": B + "/sheets-sateen.png",
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
            print("OK:", ext_id, "|", img_url.split("/")[-1]); ok += 1
    except urllib.error.HTTPError as e:
        print("GRESKA", ext_id, e.code, e.read().decode()[:80])

print("\nGotovo!", ok, "/ 12 azurirano.")
