const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const fs = require("fs");
const path = require("path");

const { ConsoleColors } = require("./console-colors");

/** * @constant {string} EXPORT_DIR - Ścieżka relatywna do katalogu, w którym zapisywane są pliki JSON.
 */
const EXPORT_DIR = "./export_files";

/** * @typedef {Object} Związek
 * @property {string} name - Pełna nazwa Związku (małymi literami, bez polskich znaków).
 * @property {string} code - Dwuliterowy kod związku (np. 'DS', 'KP').
 */
const ZWIAZKI = [
  { name: "polski", code: "" },
  { name: "dolnoslaski", code: "DS" },
  { name: "kujawsko_pomorski", code: "KP" },
  { name: "lubuski", code: "LB" },
  { name: "lodzki", code: "LD" },
  { name: "lubelski", code: "LU" },
  { name: "mazowiecki", code: "MA" },
  { name: "malopolski", code: "MP" },
  { name: "opolski", code: "OP" },
  { name: "podkarpacki", code: "PK" },
  { name: "podlaski", code: "PL" },
  { name: "pomorski", code: "PO" },
  { name: "swietokrzyski", code: "SK" },
  { name: "slaski", code: "SL" },
  { name: "warminsko_mazurski", code: "WM" },
  { name: "wielkopolski", code: "WP" },
  { name: "zachodniopomorski", code: "ZP" },
];

/**
 * Czyści surowy tekst z elementu HTML, usuwając zbędne białe znaki oraz artefakty strony.
 * * @param {import('cheerio').Cheerio} el - Obiekt Cheerio reprezentujący komórkę tabeli <td>.
 * @returns {string} Oczyszczony ciąg znaków.
 */
const clean = (el) =>
  el.text().trim().replace(/\s+/g, " ").replace(" FOTO", "");

/**
 * Parsuje tabelę HTML z listą zawodników na tablicę obiektów.
 * * @param {import('cheerio').CheerioAPI} $ - Załadowana instancja Cheerio z kodem HTML strony.
 * @returns {Array<{
 * id: string,
 * id_pzszach: string,
 * nazwisko_imie: string,
 * tytul_kategoria: string,
 * rank_fide: string,
 * klub: string,
 * wojewodztwo_zwiazek: string
 * }>} Tablica obiektów zawodników.
 */
function parseZawodnicy($) {
  const wyniki = [];
  $("table tr").each((i, el) => {
    const tds = $(el).find("td");
    const lp = clean($(tds[0]));
    if (lp && !isNaN(lp)) {
      wyniki.push({
        id: lp,
        id_pzszach: clean($(tds[1])),
        nazwisko_imie: clean($(tds[2])),
        tytul_kategoria: clean($(tds[3])),
        rank_fide: clean($(tds[4])),
        klub: clean($(tds[5])),
        wojewodztwo_zwiazek: clean($(tds[6])),
      });
    }
  });
  return wyniki;
}

/**
 * Parsuje tabelę HTML z ewidencją klubów na tablicę obiektów.
 * * @param {import('cheerio').CheerioAPI} $ - Załadowana instancja Cheerio.
 * @returns {Array<{
 * id: string,
 * nr_pzszach: string,
 * nazwa: string,
 * miasto: string,
 * licencja: string,
 * wojewodztwo_zwiazek: string,
 * typ_czlonka: string,
 * oplata_roczna: string
 * }>} Tablica obiektów klubów.
 */
function parseKluby($) {
  const wyniki = [];
  $("table tr").each((i, el) => {
    const tds = $(el).find("td");
    const lp = clean($(tds[0]));
    if (lp && !isNaN(lp)) {
      wyniki.push({
        id: lp,
        nr_pzszach: clean($(tds[1])),
        nazwa: clean($(tds[2])),
        miasto: clean($(tds[3])),
        licencja: clean($(tds[4])),
        wojewodztwo_zwiazek: clean($(tds[5])),
        typ_czlonka: clean($(tds[6])),
        oplata_roczna: clean($(tds[7])),
      });
    }
  });
  return wyniki;
}

/**
 * Funkcja zwracająca listę zadań dla konkretnego kodu związku
 */
const getTasks = (code) => [
  {
    type: "zawodnicy",
    url: `https://www.cr-pzszach.pl/ew/viewpage.php?page_id=1&zwiazek=${code}&typ_czlonka=0&sort=ELO&malejaco=true`,
    parser: parseZawodnicy,
    limits: [10, 100, 500],
  },
  {
    type: "kluby",
    url: `https://www.cr-pzszach.pl/ew/viewpage.php?page_id=2&zwiazek=${code}&typ_czlonka=0`,
    parser: parseKluby,
    limits: [10, 100],
  },
];

/**
 * @typedef {Object} ScrapedData
 * @property {string} createdAt - Data utworzenia pliku w formacie ISO.
 * @property {number} totalRecords - Liczba rekordów w pliku.
 * @property {Array<Object>} data - Tablica z właściwymi danymi (zawodnicy lub kluby).
 */

/**
 * Główna funkcja sterująca procesem scrapowania.
 * * @async
 * @returns {Promise<void>}
 */
async function scrape() {
  if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

  console.log(
    `${ConsoleColors.BOLD}${ConsoleColors.CYAN}--- START SCRAPING ---${ConsoleColors.RESET}`,
  );

  for (const zwiazek of ZWIAZKI) {
    console.log(
      `\n${ConsoleColors.BOLD}>>> ZWIĄZEK: ${zwiazek.name.toUpperCase()} (${zwiazek.code})${ConsoleColors.RESET}`,
    );

    const tasks = getTasks(zwiazek.code);

    for (const source of tasks) {
      try {
        const response = await axios.get(source.url, {
          responseType: "arraybuffer",
        });
        const html = iconv.decode(Buffer.from(response.data), "win1250");
        const $ = cheerio.load(html);
        const wszystkieDane = source.parser($);

        if (wszystkieDane.length === 0) {
          console.log(
            `   ${ConsoleColors.YELLOW}[SKIP]${ConsoleColors.RESET} ${source.type.padEnd(10)} | Brak danych.`,
          );
          continue;
        }

        for (const limit of source.limits) {
          const daneLimitowane = wszystkieDane.slice(0, limit);

          const finalFileName =
            source.type === "zawodnicy"
              ? `${source.type}_${zwiazek.name}_zwiazek_top_${limit}.json`
              : `${source.type}_${zwiazek.name}_zwiazek_limit_${limit}.json`;

          /** @type {ScrapedData} */
          const output = {
            createdAt: new Date().toISOString(),
            totalRecords: daneLimitowane.length,
            data: daneLimitowane,
          };

          fs.writeFileSync(
            path.join(EXPORT_DIR, finalFileName),
            JSON.stringify(output, null, 2),
          );

          console.log(
            `   ${ConsoleColors.GREEN}[OK]${ConsoleColors.RESET} ${finalFileName.padEnd(45)} | Rekordów: ${daneLimitowane.length}`,
          );
        }
      } catch (error) {
        console.log(
          `   ${ConsoleColors.RED}[FAIL]${ConsoleColors.RESET} ${source.type.padEnd(10)} | Błąd: ${error.message}`,
        );
      }
    }
  }

  console.log(
    `\n${ConsoleColors.BOLD}${ConsoleColors.GREEN}WSZYSTKO GOTOWE!${ConsoleColors.RESET}\n`,
  );
}

module.exports = { scrape };
