// El repo raíz contiene un eslint.config.js (flat config de Expo). ESLint 8.x,
// al encontrarlo en un directorio padre, entra en modo flat y rechaza flags como
// "--ext". Este wrapper fuerza el modo legado (que usa .eslintrc.js de este paquete)
// de forma portable entre Windows y Linux.
process.env.ESLINT_USE_FLAT_CONFIG = "false";
process.argv.push("--ext", ".js,.ts", ".");

require(require("path").join(
  __dirname,
  "..",
  "node_modules",
  "eslint",
  "bin",
  "eslint.js",
));