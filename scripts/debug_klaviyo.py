import urllib.request, urllib.parse, json, sys

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# Get finae-3 real ID
r = urllib.request.urlopen(urllib.request.Request(
    'https://a.klaviyo.com/api/catalog-items/?filter=equals(external_id,"finae-3")',
    headers={"Authorization":f"Klaviyo-API-Key {API}","revision":"2024-02-15"}))
item = json.loads(r.read())["data"][0]
real_id = item["id"]
print("real_id:", real_id)

# Try PATCH - catch error body
img_url = "https://i.imgur.com/IZv5zv4.jpeg"
payload = json.dumps({
    "data":{
        "type":"catalog-item",
        "id": real_id,
        "attributes":{"image_full_url": img_url}
    }
}).encode()

try:
    req = urllib.request.Request(
        f"https://a.klaviyo.com/api/catalog-items/{urllib.parse.quote(real_id, safe='')}/",
        data=payload, method="PATCH",
        headers={
            "Authorization": f"Klaviyo-API-Key {API}",
            "revision": "2024-02-15",
            "Content-Type": "application/json"
        })
    with urllib.request.urlopen(req) as resp:
        print("SUCCESS:", resp.read().decode()[:300])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code} error body:")
    print(body)
except Exception as e:
    print("Other error:", e)
