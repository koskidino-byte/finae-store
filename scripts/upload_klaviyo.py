import urllib.request
import json

API_KEY = "pk_Xwqrmr_f475d8ed0b6d65b102e3a3620eb8675c40"
BASE_URL = "https://02281622-b839-486f-8cf6-ee32e50bd821-00-2hf1fd36gxnp6.kirk.replit.dev"

products = [
    ("finae-1", "Classic Percale Sheet Set", 89.99, "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", "Classic percale cotton sheet set."),
    ("finae-2", "Stonewashed Linen Sheet Set", 179.99, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600", "Stonewashed linen sheet set."),
    ("finae-3", "Plush Bath Towel Set", 64.99, "https://images.unsplash.com/photo-1606944416490-c39a10c90bb5?w=600", "Ultra-soft plush bath towel set."),
    ("finae-4", "Quick-Dry Bath Towels", 44.99, "https://images.unsplash.com/photo-1620626011761-996317702a8b?w=600", "Quick-dry bath towels."),
    ("finae-5", "Spa Turkish Towels", 54.99, "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600", "Authentic Turkish spa towels."),
    ("finae-6", "Classic Crew Socks 3-Pack", 18.99, "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600", "Classic crew socks 3-pack."),
    ("finae-7", "Merino Wool Socks 2-Pack", 28.99, "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600", "Premium merino wool socks."),
    ("finae-8", "Cloud Nine Pillowcase Set", 34.99, "https://images.unsplash.com/photo-1592789705501-f9ae4278a9c9?w=600", "Silky-smooth pillowcase set."),
    ("finae-9", "Everyday Percale Pillowcase Pair", 24.99, "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600", "Crisp percale pillowcases."),
    ("finae-10", "Linen Blend Pillowcase Set", 44.99, "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600", "Natural linen blend pillowcases."),
    ("finae-11", "Cozy Lounge Socks", 14.99, "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", "Super cozy lounge socks."),
    ("finae-12", "Luxe Sateen Sheet Set", 129.99, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600", "Luxurious sateen sheet set."),
]

for ext_id, title, price, image, description in products:
    data = json.dumps({"data": {"type": "catalog-item", "attributes": {
        "external_id": ext_id, "title": title, "price": price,
        "url": BASE_URL, "image_full_url": image, "description": description,
        "catalog_type": "$default", "integration_type": "$custom", "published": True
    }}}).encode()
    req = urllib.request.Request("https://a.klaviyo.com/api/catalog-items/",
        data=data, method="POST",
        headers={"Authorization": f"Klaviyo-API-Key {API_KEY}",
                 "revision": "2024-02-15", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            print(f"OK: {title}")
    except Exception as e:
        print(f"Greska {title}: {e}")
