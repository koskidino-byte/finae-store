import urllib.request, json, re

# Scrape product images directly from the FINAE website
BASE_URL = "https://02281622-b839-486f-8cf6-ee32e50bd821-00-2hf1fd36gxnp6.kirk.replit.dev"

try:
    r = urllib.request.urlopen(BASE_URL + "/api/products")
    products = json.loads(r.read())
    print("Pronasao", len(products), "proizvoda:\n")
    for p in products:
        img = p.get("imageUrl") or p.get("image") or p.get("image_url") or ""
        name = p.get("name") or p.get("title") or ""
        ext_id = p.get("id") or ""
        if img and not img.startswith("http"):
            img = BASE_URL + img
        print(f'"{ext_id}" | {name}')
        print(f'  -> {img}')
except Exception as e:
    print("API greska:", e)
    # Try fetching the HTML page directly
    try:
        r = urllib.request.urlopen(BASE_URL + "/products")
        html = r.read().decode()
        imgs = re.findall(r'src=["\']([^"\']*products[^"\']*)["\']', html)
        print("Slike nadjene u HTML-u:")
        for img in set(imgs):
            print(" ", BASE_URL + img if not img.startswith("http") else img)
    except Exception as e2:
        print("HTML greska:", e2)
