import urllib.request, urllib.parse, json

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"

# Step 1: Get finae-3 real ID and current data
r = urllib.request.urlopen(urllib.request.Request(
    'https://a.klaviyo.com/api/catalog-items/?filter=equals(external_id,"finae-3")',
    headers={"Authorization":f"Klaviyo-API-Key {API}","revision":"2024-02-15"}))
data = json.loads(r.read())
item = data["data"][0]
real_id = item["id"]
print("real_id:", real_id)
print("current attrs:", json.dumps(item["attributes"], indent=2))

# Step 2: Try PATCH with imgur URL - show full error
img_url = "https://i.imgur.com/IZv5zv4.jpeg"  # the one that worked
payload = json.dumps({"data":{"type":"catalog-item","id":real_id,"attributes":{"image_full_url":img_url}}}).encode()
try:
    req = urllib.request.Request(
        f"https://a.klaviyo.com/api/catalog-items/{urllib.parse.quote(real_id,safe='')}/",
        data=payload, method="PATCH",
        headers={"Authorization":f"Klaviyo-API-Key {API}","revision":"2024-02-15","Content-Type":"application/json"})
    with urllib.request.urlopen(req) as r2:
        print("SUCCESS:", r2.read().decode()[:200])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"ERROR {e.code}:", body)
