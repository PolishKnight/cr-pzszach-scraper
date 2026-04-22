# CR PZSzach Scraper

**PL:** Ekstraktor danych z Centralnego Rejestru Polskiego Związku Szachowego.  
**EN:** Data extractor for the Polish Chess Federation Central Registry.

---

## 📝 Opis projektu

Narzędzie automatyzujące proces pobierania danych z [Centralnego Rejestru PZSzach](https://www.cr-pzszach.pl/).
Skrypt pobiera informacje o zawodnikach oraz klubach, parsuje je z formatu HTML (kodowanie win1250) i zapisuje w ustrukturyzowanych plikach JSON.

### Kluczowe funkcje:

- **Optymalizacja zapytań:** Pobiera dane raz dla danego typu, generując wiele wersji plików (top 10, 100, 500 dla zawodników, limit 10, 100 dla drużyn).
- **Metadane:** Każdy plik JSON zawiera znacznik czasu (`createdAt`) oraz liczbę rekordów.
- **Obsługa polskich znaków:** Prawidłowe dekodowanie tekstów dzięki bibliotece `iconv-lite`.
- **Dokumentacja JSDoc:** Kod jest w pełni udokumentowany, co ułatwia jego rozwój i utrzymanie.

---

## 🚀 Szybki start

### Wymagania

- Node.js (zalecana wersja 18.x lub nowsza)
- npm (menedżer pakietów)

### Instalacja

1. Sklonuj repozytorium:

   ```bash
   git clone https://github.com/PolishKnight/cr-pzszach-scraper.git
   ```

2. Przejdź do katalogu:

   ```bash
   cd cr-pzszach-scraper
   ```

3. Zainstaluj zależności:

   ```bash
   npm install
   ```

4. Aby rozpocząć proces scrapowania, uruchom:

   ```bash
   node index.js
   ```

5. Otrzymasz gotowe pliki w katalogu `export_files/`

---

## 📂 Struktura projektu

```text
cr-pzszach-scraper/
├── src/
│   ├── server.js           # Główna logika scrapowania i parsowania
│   └── console-colors.js   # Klasa pomocnicza do kolorowania logów
├── export_files/           # Katalog wyjściowy dla plików JSON (ignorowany przez git)
├── index.js                # Punkt wejścia aplikacji
├── package.json            # Zależności i skrypty npm
├── .gitignore              # Definicja plików ignorowanych przez system kontroli wersji
└── README.md               # Dokumentacja projektu
```

---

## 📊 Przykład struktury pliku wyjściowego

Każdy wygenerowany plik JSON posiada metadane ułatwiające późniejszą analizę:

```json
{
  "createdAt": "2024-05-20T12:00:00.000Z",
  "totalRecords": 100,
  "data": [
    {
      "id": "1",
      "id_pzszach": "12345",
      "nazwisko_imie": "Jan Kowalski",
      "tytul_kategoria": "m",
      "rank_fide": "2400",
      "klub": "Nazwa Klubu",
      "wojewodztwo_zwiazek": "DS"
    }
  ]
}
```

---

## 🛠 Technologie

Projekt wykorzystuje sprawdzone biblioteki:

- Axios – obsługa zapytań HTTP.
- Cheerio – szybkie parsowanie struktury HTML.
- Iconv-lite – wsparcie dla kodowania win1250.

---

## 📜 Licencja

Projekt udostępniony na licencji MIT.

---

## 🤝 Wsparcie

Jeśli znalazłeś błąd lub masz pomysł na nową funkcjonalność, otwórz "Issue" lub prześlij "Pull Request".
