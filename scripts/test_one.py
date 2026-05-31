import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# First: get ALL catalog items (no filter)
r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
data = json.loads(r.read())
items = data["data"]
print("Pronadjeno stavki:", len(items))
for it in items:
    print(" ", it["id"], "|", it["attributes"].get("title",""), "|", it["attributes"].get("image_full_url","(nema slike)")[:60])
