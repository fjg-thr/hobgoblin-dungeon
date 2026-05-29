import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "public/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        AudioContext: "readonly",
        Blob: "readonly",
        Buffer: "readonly",
        CanvasRenderingContext2D: "readonly",
        HTMLCanvasElement: "readonly",
        Image: "readonly",
        ImageData: "readonly",
        MouseEvent: "readonly",
        OffscreenCanvas: "readonly",
        Path2D: "readonly",
        Storage: "readonly",
        URL: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        document: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        window: "readonly"
      }
    }
  },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  }
);
