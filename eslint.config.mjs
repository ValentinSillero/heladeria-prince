import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Reglas pensadas para React Compiler (el proyecto no lo usa). Marcan patrones de la
      // plantilla que funcionan bien: guardar el último callback en una ref, conservar el
      // contenido de un panel mientras se cierra y cargar el carrito del navegador al montar.
      // Quedan como advertencia para revisarlas si algún día se activa React Compiler.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "design/**"]),
]);
