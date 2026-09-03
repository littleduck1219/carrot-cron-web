import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        seedDesignPlugin({ colorMode: "dark-only" }),
    ],
    resolve: {
        tsconfigPaths: true,
    },
});
