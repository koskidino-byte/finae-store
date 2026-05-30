import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?filter=equals(external_id,\"finae-3\")",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
item = json.loads(r.read())["data"][0]
real_id = item["id"]
print("real_id:", real_id)

img_url = "https://i.imgur.com/IZv5zv4.jpeg"
payload = json.dumps({"data": {"type": "catalog-item", "id": real_id, "attributes": {"image_full_url": img_url}}}).encode()

try:
    req = urllib.request.Request(
        "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id, safe="") + "/",
        data=payload,
        method="PATCH",
        headers={
            "Authorization": "Klaviyo-API-Key " + API,
            "revision": "2024-02-15",
            "Content-Type": "application/json"
        })
    with urllib.request.urlopen(req) as resp:
        print("OK:", resp.read().decode()[:100])
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode())
