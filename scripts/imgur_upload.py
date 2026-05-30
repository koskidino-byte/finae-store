import urllib.request, urllib.parse, json, base64, time

API = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
IMGUR_CLIENT = "546c25a59c58ad7"
BASE = "https://raw.githubusercontent.com/koskidino-byte/finae-store/main/attached_assets/products"

FILES = {
    "sheets-linen.png":    ["finae-1","finae-2"],
    "towel-plush.png":     ["finae-3"],
    "towel-quickdry.png":  ["finae-4"],
    "towel-turkish.png":   ["finae-5"],
    "socks-crew.png":      ["finae-6","finae-7","finae-11"],
    "pillowcase-cloud.png":["finae-8"],
    "pillowcase-linen.png":["finae-9","finae-10"],
    "sheets-sateen.png":   ["finae-12"],
}

img_urls = {}
print("Uploadam slike na Imgur...")
for fname, ext_ids in FILES.items():
    try:
        raw = urllib.request.urlopen(f"{BASE}/{fname}").read()
        b64 = base64.b64encode(raw).decode()
        req = urllib.request.Request(
            "https://api.imgur.com/3/image",
            data=urllib.parse.urlencode({"image": b64, "type": "base64"}).encode(),
            headers={"Authorization": f"Client-ID {IMGUR_CLIENT}"})
        res = json.loads(urllib.request.urlopen(req).read())
        url = res["data"]["link"]
        for eid in ext_ids:
            img_urls[eid] = url
        print(f"  OK: {fname} -> {url}")
        time.sleep(0.5)
    except Exception as e:
        print(f"  GRESKA {fname}: {e}")

print(f"\nAzuriram Klaviyo ({len(img_urls)} proizvoda)...")
ok = 0
for ext_id, img_url in img_urls.items():
    try:
        r = urllib.request.urlopen(urllib.request.Request(
            f'https://a.klaviyo.com/api/catalog-items/?filter=equals(external_id,"{ext_id}")',
            headers={"Authorization":f"Klaviyo-API-Key {API}","revision":"2024-02-15"}))
        items = json.loads(r.read()).get("data",[])
        if not items: print(f"  nije pronadjen: {ext_id}"); continue
        real_id = items[0]["id"]
        data = json.dumps({"data":{"type":"catalog-item","id":real_id,"attributes":{"image_full_url":img_url}}}).encode()
        urllib.request.urlopen(urllib.request.Request(
            f"https://a.klaviyo.com/api/catalog-items/{urllib.parse.quote(real_id,safe='')}/",
            data=data,method="PATCH",
            headers={"Authorization":f"Klaviyo-API-Key {API}","revision":"2024-02-15","Content-Type":"application/json"}))
        print(f"  OK: {ext_id}")
        ok += 1
    except Exception as e:
        print(f"  GRESKA {ext_id}: {e}")

print(f"\nGotovo! {ok}/12 azurirano.")
