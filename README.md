# Strefa Diamond Dart Scoreboard

Prosta webowa apka do liczenia darta w klimacie Strefa Diamond.

## Funkcje
- Strona główna z logo, hasłem i dwoma opcjami: Dart Scoreboard oraz Nakka.
- Ustawienia meczu: 1-4 zawodników, własne imiona, wybór trybu kończenia (double/single), start 301/501/701.
- Ekran liczenia z klawiaturą numeryczną i wyróżnionym aktualnym zawodnikiem.
- Link do strony głównej na każdym ekranie.
- Podpowiedzi checkoutów dla wartości <= 180.
- Widok zaprojektowany pod orientację poziomą.

## Uruchomienie lokalne
```bash
python3 -m http.server 4173
```
Potem otwórz `http://localhost:4173`.

## Deployment
### Netlify
- Build command: *(puste)*
- Publish directory: `.`

### Railway
- Service typu Static Site albo Nixpacks
- Start command: `python3 -m http.server $PORT`
