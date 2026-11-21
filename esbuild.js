const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const sass = require('sass');

const watch = process.argv.includes('--watch');

const mmbnGames = ['mmbn1', 'mmbn2', 'mmbn3', 'mmbn4', 'mmbn5'];

async function buildStyles() {
  fs.mkdirSync('dist', { recursive: true });

  const webviewStyles = sass.compile('webview/styles.scss', {
    style: 'compressed',
    loadPaths: ['webview'],
    silenceDeprecations: ['import']
  });
  fs.writeFileSync('dist/styles.css', webviewStyles.css);

  for (const game of ['mmbn', 'metroid', 'pokemon']) {
    const source = path.join('webview', 'styles', game, 'preview.scss');
    const output = path.join('webview', 'styles', game, 'preview.css');
    fs.writeFileSync(output, sass.compile(source, {
      style: 'compressed',
      silenceDeprecations: ['import']
    }).css);
  }

  for (const game of mmbnGames) {
    const source = path.join('webview', 'styles', 'mmbn', game, 'preview.scss');
    const output = path.join('webview', 'styles', 'mmbn', game, 'preview.css');
    fs.writeFileSync(output, sass.compile(source, {
      style: 'compressed',
      silenceDeprecations: ['import']
    }).css);
  }

  fs.writeFileSync(
    path.join('webview', 'styles', 'castlevania', 'preview.css'),
    sass.compile(path.join('webview', 'styles', 'castlevania', 'preview.scss'), {
      style: 'compressed',
      silenceDeprecations: ['import']
    }).css
  );
}

async function build() {
  await buildStyles();

  const common = {
    bundle: true,
    sourcemap: !process.argv.includes('--production'),
    minify: process.argv.includes('--production'),
    logLevel: 'info'
  };

  const extension = {
    ...common,
    entryPoints: ['src/extension.ts'],
    platform: 'node',
    format: 'cjs',
    outfile: 'dist/extension.js',
    external: ['vscode']
  };

  const webview = {
    ...common,
    entryPoints: ['webview/index.tsx'],
    platform: 'browser',
    format: 'iife',
    outfile: 'dist/webview.js',
    jsx: 'automatic'
  };

  if (watch) {
    const [extensionContext, webviewContext] = await Promise.all([
      esbuild.context(extension),
      esbuild.context(webview)
    ]);
    await Promise.all([extensionContext.watch(), webviewContext.watch()]);
    let styleBuildTimer;
    const watchStyles = () => {
      clearTimeout(styleBuildTimer);
      styleBuildTimer = setTimeout(() => {
        buildStyles().catch((error) => {
          console.error(error);
        });
      }, 50);
    };
    fs.watch('webview', { recursive: true }, watchStyles);
    fs.watch('assets', { recursive: true }, watchStyles);
  } else {
    await Promise.all([esbuild.build(extension), esbuild.build(webview)]);
  }
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
