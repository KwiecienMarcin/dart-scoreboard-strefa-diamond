# Strefa Diamond Dart Scoreboard

Prosta webowa apka do liczenia darta w klimacie Strefa Diamond.

## Funkcje
- Strona główna z logo, hasłem i dwoma opcjami: Dart Scoreboard oraz Nakka.
- Ustawienia meczu: 1-4 zawodników, własne imiona, wybór trybu kończenia (double/single), start 301/501/701.
- Ekran liczenia z klawiaturą numeryczną i wyróżnionym aktualnym zawodnikiem.
- Link do strony głównej na każdym ekranie.
- Podpowiedzi checkoutów dla wartości <= 180.
- Widok zaprojektowany pod orientację poziomą.
- Branding Strefa Diamond z głównym logo `assets/logo_full.svg`.

## Uruchomienie lokalne
```bash
python3 -m http.server 4173
```
Potem otwórz `http://localhost:4173`.

## Deployment
### Netlify (zalecane)
Repo zawiera już konfigurację:
- `netlify.toml` z `publish = "."`
- fallback SPA (`/* -> /index.html 200`)
- plik `_redirects` jako dodatkowe zabezpieczenie

#### Kroki
1. Netlify → **Add new site** → **Import an existing project**.
2. Wybierz repo.
3. Build command: *(puste)*.
4. Publish directory: `.`.
5. Deploy.

#### Gdy widzisz "Page not found"
- sprawdź, czy deploy bierze **branch z tym commitem** (z `netlify.toml` i `_redirects`)
- sprawdź, czy Publish directory to **`.`**
- zrób **Clear cache and deploy site**

### Railway
- Service typu Static Site albo Nixpacks
- Start command: `python3 -m http.server $PORT`
