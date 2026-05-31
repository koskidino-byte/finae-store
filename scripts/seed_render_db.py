import urllib.request, json

API = "https://finae-api.onrender.com"

products = [
    {"name": "Classic Percale Sheet Set", "description": "Crisp, cool 100% cotton percale sheets. Available in Twin, Full, Queen, King.", "price": 8999, "category": "sheets", "imageUrl": "/products/sheets-percale.png", "inventory": 50},
    {"name": "Stonewashed Linen Sheet Set", "description": "Pre-washed Belgian linen with that effortless rumpled look. Regulates temperature all year round.", "price": 17999, "category": "sheets", "imageUrl": "/products/sheets-linen.png", "inventory": 50},
    {"name": "Luxe Sateen Sheet Set", "description": "Silky-smooth 400 thread count sateen weave. Incredibly soft against your skin.", "price": 12999, "category": "sheets", "imageUrl": "/products/sheets-sateen.png", "inventory": 50},
    {"name": "Plush Bath Towel Set", "description": "Ultra-absorbent zero-twist cotton towels. 700 GSM weight. Set of 6.", "price": 6499, "category": "towels", "imageUrl": "/products/towel-plush.png", "inventory": 50},
    {"name": "Quick-Dry Bath Towels", "description": "Lightweight microfibre towels that dry 3x faster than regular cotton.", "price": 4499, "category": "towels", "imageUrl": "/products/towel-quickdry.png", "inventory": 50},
    {"name": "Spa Turkish Towels", "description": "Traditional Turkish cotton peshtemal towels. Lightweight and quick-drying.", "price": 5499, "category": "towels", "imageUrl": "/products/towel-turkish.png", "inventory": 50},
    {"name": "Classic Crew Socks 3-Pack", "description": "Everyday cotton crew socks in a classic style. Available S, M, L, XL.", "price": 1899, "category": "socks", "imageUrl": "/products/socks-crew.png", "inventory": 100},
    {"name": "Merino Wool Socks 2-Pack", "description": "Premium merino wool socks for warmth and comfort. Natural temperature regulation.", "price": 2899, "category": "socks", "imageUrl": "/products/socks-merino.png", "inventory": 100},
    {"name": "Cozy Lounge Socks", "description": "Extra-thick fluffy socks perfect for lounging at home.", "price": 1499, "category": "socks", "imageUrl": "/products/socks-lounge.png", "inventory": 100},
    {"name": "Cloud Nine Pillowcase Set", "description": "Silky-smooth sateen weave pillowcases. Envelope closure. Available in White, Ivory, Sage.", "price": 3499, "category": "pillowcases", "imageUrl": "/products/pillowcase-cloud.png", "inventory": 50},
    {"name": "Everyday Percale Pillowcase Pair", "description": "Crisp cotton percale pillowcases. Easy care, machine washable.", "price": 2499, "category": "pillowcases", "imageUrl": "/products/pillowcase-percale.png", "inventory": 50},
    {"name": "Linen Blend Pillowcase Set", "description": "Relaxed linen-cotton blend pillowcases with a natural, textured look.", "price": 4499, "category": "pillowcases", "imageUrl": "/products/pillowcase-linen.png", "inventory": 50},
]

print("Dodajem proizvode u Render bazu...")
ok = 0
for p in products:
    try:
        data = json.dumps(p).encode()
        req = urllib.request.Request(
            API + "/api/products",
            data=data,
            headers={"Content-Type": "application/json", "x-admin-password": "FINAE-ADMIN-2025"}
        )
        with urllib.request.urlopen(req) as r:
            result = json.loads(r.read())
            print(f"  OK: {p['name']}")
            ok += 1
    except Exception as e:
        print(f"  GRESKA {p['name']}: {e}")

print(f"\nGotovo! {ok}/12 proizvoda dodano.")
