const { scrape } = require("./src/scraper");
const { ConsoleColors } = require("./src/console-colors");

async function main() {
  try {
    console.log(
      `${ConsoleColors.CYAN}Inicjalizacja aplikacji...${ConsoleColors.RESET}`,
    );
    await scrape();
    console.log(
      `${ConsoleColors.GREEN}[SUCCESS]${ConsoleColors.RESET} Zakończenie eksportów`,
    );
  } catch (err) {
    console.error(`${ConsoleColors.RED}[ERROR]${ConsoleColors.RESET} `, err);
  }
}

main();
