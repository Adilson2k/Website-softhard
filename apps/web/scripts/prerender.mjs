import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const projectRoot = process.cwd();
const vite = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { default: App } = await vite.ssrLoadModule("/src/App.tsx");
  const { notFoundRoute, pageMetadata, pageRoutes } =
    await vite.ssrLoadModule("/src/routes.ts");
  const templatePath = resolve(projectRoot, "dist/index.html");
  const template = await readFile(templatePath, "utf8");
  const rootPlaceholder = '<div id="root"></div>';

  if (!template.includes(rootPlaceholder)) {
    throw new Error("Could not find the #root element in dist/index.html");
  }

  async function prerenderPage(route, outputPath, metadata, robotsContent) {
    const renderedApp = renderToString(
      React.createElement(App, { initialPath: route }),
    );
    const html = template
      .replace(rootPlaceholder, `<div id="root">${renderedApp}</div>`)
      .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
        `<meta name="description" content="${metadata.description}" />`,
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${metadata.title}" />`,
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${metadata.description}" />`,
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
        `<meta name="twitter:title" content="${metadata.title}" />`,
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${metadata.description}" />`,
      )
      .replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/,
        `<meta name="robots" content="${robotsContent}" />`,
      );

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
  }

  for (const route of pageRoutes) {
    const outputPath =
      route === "/"
        ? templatePath
        : resolve(projectRoot, "dist", route.slice(1), "index.html");
    await prerenderPage(
      route,
      outputPath,
      pageMetadata[route],
      "index, follow, max-image-preview:large",
    );
  }

  await prerenderPage(
    notFoundRoute,
    resolve(projectRoot, "dist", "404.html"),
    pageMetadata[notFoundRoute],
    "noindex, follow",
  );
} finally {
  await vite.close();
}
