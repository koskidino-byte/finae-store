# FINAE — Besplatno deploy upute

## Cilj
Stranica radi 24/7 bez placanja Replita.

## Najbolja besplatna opcija: Render.com

### Korak 1: Preuzmi kod iz Replita
1. Otvori Replit projekt
2. Klikni **File** (gore lijevo) → **Download as ZIP**
3. Spremi ZIP na racunalo

### Korak 2: Upload na GitHub
1. Idi na **github.com/koskidino-byte/finae-store**
2. Klikni **Add file** → **Upload files**
3. Odaberi ZIP koji si preuzeo
4. Klikni **Commit changes**

### Korak 3: Deploy na Render
1. Idi na **render.com** → Sign up (besplatno)
2. Klikni **New** → **Web Service**
3. Connect **GitHub** → odaberi `koskidino-byte/finae-store`
4. Postavi:
   - **Name:** `finae-api`
   - **Environment:** Node
   - **Build Command:** `npm install -g pnpm && pnpm install`
   - **Start Command:** `pnpm --filter @workspace/api-server run start`
   - **Plan:** Free
5. Klikni **Create Web Service**

### Korak 4: Baza (besplatno na Render)
1. Render Dashboard → **New** → **PostgreSQL**
2. Plan: Free
3. Kopiraj **Internal Database URL**
4. Vrati se na Web Service → **Environment** → dodaj varijablu:
   - `DATABASE_URL` = kopiraj URL baze

### Korak 5: Frontend (Vercel — besplatno)
1. Idi na **vercel.com** → Sign up
2. Import GitHub repo `koskidino-byte/finae-store`
3. Build: `pnpm --filter @workspace/store run build`
4. Output: `artifacts/store/dist`
5. Deploy

### Korak 6: Spoji frontend i backend
- Vercel frontend salje API pozive na Render backend URL
- Postavi `BASE_URL` varijablu na Vercel = tvoj Render URL

## Sto ocekivati
- Render free: stranica "zaspava" nakon 15 min neaktivnosti
- Prvi posjet nakon 15 min traje ~30 sekundi dok se "probudi"
- Vercel free: frontend uvijek brz
- PostgreSQL free: 1GB limit (dovoljno za pocetak)

## Alternativa
Ako ovo previsoki zahtjevno, jednostavno plati Replit deploy $25/mj. Jedan klik, sve radi.

## Upozorenje
- Na free planu, nema custom domene (byfinae.com)
- URL ce biti `finae-api.onrender.com` i `finae.vercel.app`
- Kad krenu prodaje, preci na placeni plan
