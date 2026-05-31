import urllib.request, json

API = "https://finae-api.onrender.com"

products = [
    {"name": "Classic Percale Sheet Set", "description": "Crisp, cool 100% cotton percale sheets.", "price": 8999, "category": "sheets", "imageUrl": "/products/sheets-percale.png", "inStock": True, "featured": True},
    {"name": "Stonewashed Linen Sheet Set", "description": "Pre-washed Belgian linen with effortless rumpled look.", "price": 17999, "category": "sheets", "imageUrl": "/products/sheets-linen.png", "inStock": True, "featured": True},
    {"name": "Luxe Sateen Sheet Set", "description": "Silky-smooth 400 thread count sateen weave.", "price": 12999, "category": "sheets", "imageUrl": "/products/sheets-sateen.png", "inStock": True, "featured": True},
    {"name": "Plush Bath Towel Set", "description": "Ultra-absorbent zero-twist cotton towels. Set of 6.", "price": 6499, "category": "towels", "imageUrl": "/products/towel-plush.png", "inStock": True, "featured": True},
    {"name": "Quick-Dry Bath Towels", "description": "Lightweight microfibre towels that dry 3x faster.", "price": 4499, "category": "towels", "imageUrl": "/products/towel-quickdry.png", "inStock": True},
    {"name": "Spa Turkish Towels", "description": "Traditional Turkish cotton peshtemal towels.", "price": 5499, "category": "towels", "imageUrl": "/products/towel-turkish.png", "inStock": True},
    {"name": "Classic Crew Socks 3-Pack", "description": "Everyday cotton crew socks.", "price": 1899, "category": "socks", "imageUrl": "/products/socks-crew.png", "inStock": True},
    {"name": "Merino Wool Socks 2-Pack", "description": "Premium merino wool socks.", "price": 2899, "category": "socks", "imageUrl": "/products/socks-merino.png", "inStock": True, "featured": True},
    {"name": "Cozy Lounge Socks", "description": "Extra-thick fluffy socks for lounging.", "price": 1499, "category": "socks", "imageUrl": "/products/socks-lounge.png", "inStock": True},
    {"name": "Cloud Nine Pillowcase Set", "description": "Silky-smooth sateen weave pillowcases.", "price": 3499, "category": "pillowcases", "imageUrl": "/products/pillowcase-cloud.png", "inStock": True, "featured": True},
    {"name": "Everyday Percale Pillowcase Pair", "description": "Crisp cotton percale pillowcases.", "price": 2499, "category": "pillowcases", "imageUrl": "/products/pillowcase-percale.png", "inStock": True},
    {"name": "Linen Blend Pillowcase Set", "description": "Relaxed linen-cotton blend pillowcases.", "price": 4499, "category": "pillowcases", "imageUrl": "/products/pillowcase-linen.png", "inStock": True},
]

print("Dodajem proizvode u Render bazu...")
ok = 0
for p in products:
    try:
        data = json.dumps(p).encode()
        req = urllib.request.Request(
            API + "/api/products",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as r:
            print(f"  OK: {p['name']}")
            ok += 1
    except urllib.error.HTTPError as e:
        print(f"  GRESKA {p['name']}: {e.code} {e.read().decode()[:100]}")

print(f"\nGotovo! {ok}/12 proizvoda dodano.")
