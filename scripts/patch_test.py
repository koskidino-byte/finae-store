import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# Get finae-3 real ID
r = urllib.request.urlopen(urllib.request.Request(
    "https://a.klaviyo.com/api/catalog-items/?page[size]=50",
    headers={"Authorization": "Klaviyo-API-Key " + API, "revision": "2024-02-15"}))
items = json.loads(r.read())["data"]
finae3 = next(it for it in items if it["attributes"].get("external_id") == "finae-3")
real_id = finae3["id"]
print("ID:", real_id)

# Try PATCH with an unsplash URL (like the ones already there - should work)
test_url = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"
payload = json.dumps({
    "data": {
        "type": "catalog-item",
        "id": real_id,
        "attributes": {"image_full_url": test_url}
    }
}).encode()
print("Payload:", payload.decode())
print("Encoded ID:", urllib.parse.quote(real_id, safe=""))

try:
    req = urllib.request.Request(
        "https://a.klaviyo.com/api/catalog-items/" + urllib.parse.quote(real_id, safe="") + "/",
        data=payload, method="PATCH",
        headers={
            "Authorization": "Klaviyo-API-Key " + API,
            "revision": "2024-02-15",
            "Content-Type": "application/json"
        })
    with urllib.request.urlopen(req) as resp:
        print("OK!")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP", e.code)
    print(body)
