import fs from "fs";
import path from "path";

// English
import command_en from "./en/command.json";
import component_en from "./en/component.json";

// Spanish
import command_es from "./es/command.json";

// Brazilian Portuguese
import command_pt from "./pt-BR/command.json";

// Load Data
function loadDataForLocale(locale: string): Record<string, any> {
  const dataPath = path.join(__dirname, locale, "data");
  const data: Record<string, any> = {};

  function readData(dir: string, namespace: string) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        readData(filePath, `${namespace}${namespace ? '/' : ''}${file}`);
      } else if (file.endsWith(".json")) {
        const fileData = require(filePath);
        const key = path.basename(file, ".json");
        data[`${namespace}${namespace ? '/' : ''}${key}`] = fileData;
      }
    });
  }

  readData(dataPath, "");
  return data;
}

export const resources = {
  en: {
    command: command_en,
    component: component_en,
    data: loadDataForLocale("en")
  },
  es: {
    command: command_es,
    data: loadDataForLocale("es")
  },
  pt: {
    command: command_pt,
    data: loadDataForLocale("pt-BR")
  }
};