import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import { defineConfig, type Plugin } from "vite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Dev-server persistence with no database: posts from the prototype live in data/posts.json on this machine. */
function postsFile(): Plugin {
    return {
        name: "re-carrot-posts-file",
        configureServer(server) {
            const file = resolve(server.config.root, "data/posts.json");
            const read = (): { id: string }[] => existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
            const write = (posts: { id: string }[]) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(posts)); };
            server.middlewares.use("/api/posts", (req, res) => {
                if (req.method === "DELETE") {
                    const id = decodeURIComponent((req.url ?? "").replace(/^\/|\?.*$/g, ""));
                    write(read().filter(item => item.id !== id));
                    res.statusCode = 204;
                    res.end();
                    return;
                }
                if (req.method !== "POST") {
                    res.setHeader("content-type", "application/json");
                    res.end(JSON.stringify(read()));
                    return;
                }
                let body = "";
                req.on("data", chunk => { body += chunk; });
                req.on("end", () => {
                    try {
                        const post = JSON.parse(body);
                        write([...read().filter(item => item.id !== post.id), post]);
                        res.statusCode = 204;
                    } catch { res.statusCode = 400; }
                    res.end();
                });
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        seedDesignPlugin({ colorMode: "dark-only" }),
        postsFile(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
});
