import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
B = "https://02281622-b839-486f-8cf6-ee32e50bd821-00-2hf1fd36gxnp6.kirk.replit.dev/products"

# Map by title (from Klaviyo) -> real image URL from FINAE site
TITLE_TO_IMG = {
    "Classic Percale Sheet Set":       B + "/sheets-percale.png",
    "Stonewashed Linen Sheet Set":      B + "/sheets-linen.png",
    "Luxe Sateen Sheet Set":            B + "/sheets-sateen.png",
    "Plush Bath Towel Set":             B + "/towel-plush.png",
    "Quick-Dry Bath Towels":            B + "/towel-quickdry.png",
    "Spa Turkish Towels":               B + "/towel-turkish.png",
    "Classic Crew Socks 3-Pack":        B + "/socks-crew.png",
    "Merino Wool Socks 2-Pack":         B + "/socks-merino.png",
    "Cozy Lounge Socks":                B + "/socks-lounge.png",
    "Cloud Nine Pillowcase Set":        B + "/pillowcase-cloud.png",
    "Everyday Percale Pillowcase Pair": B + "/pillowcase-percale.png",
    "Linen Blend Pillowcase Set":       B + "/pillowcase-linen.png",
}

r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
items = json.loads(r.read())["data"]

ok = 0
for item in items:
    title = item["attributes"].get("title", "")
    real_id = item["id"]
    img_url = TITLE_TO_IMG.get(title)
    if not img_url:
        print("Preskacam (nema mapiranja):", title); continue
    try:
        payload = json.dumps({"data":{"type":"catalog-item","id":real_id,"attributes":{"image_full_url":img_url}}}).encode()
        req = urllib.request.Request(
            "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id,safe="") + "/",
            data=payload, method="PATCH",
            headers={"Authorization":"Klaviyo-API-Key "+API,"revision":"2024-02-15","Content-Type":"application/json"})
        with urllib.request.urlopen(req):
            print("OK:", title); ok += 1
    except urllib.error.HTTPError as e:
        print("GRESKA", title, e.code, e.read().decode()[:80])

print("\nGotovo!", ok, "/ 12 azurirano.")
