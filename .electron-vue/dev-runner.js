(async () => {
  try {
    const chalk = await import('chalk');
    const electron = require('electron');
    const path = require('path');
    const { say } = require('cfonts');
    const { spawn } = require('child_process');
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const mainConfig = require('./webpack.main.config');
    const rendererConfig = require('./webpack.renderer.config');

    let electronProcess = null;
    let manualRestart = false;
    let hotMiddleware;

    function logStats (proc, data) {
      let log = '';

      log += chalk.default.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`);
      log += '\n\n';

      if (typeof data === 'object') {
        data.toString({
          colors: true,
          chunks: false
        }).split(/\r?\n/).forEach(line => {
          log += '  ' + line + '\n';
        });
      } else {
        log += `  ${data}\n`;
      }

      log += '\n' + chalk.default.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n';

      console.log(log);
    }

    function startRenderer () {
      return new Promise((resolve, reject) => {
        rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);
        rendererConfig.mode = 'development';
        const compiler = webpack(rendererConfig);
        hotMiddleware = webpackHotMiddleware(compiler, {
          log: false,
          heartbeat: 2500
        });

        compiler.hooks.compilation.tap('compilation', compilation => {
          hotMiddleware.publish({
            action: 'compilation',
            hash: compilation.hash
          });
        });

        compiler.hooks.done.tap('done', stats => {
          logStats('Renderer', stats);

          if (stats.hasErrors()) {
            reject(new Error('Renderer build failed'));
          } else {
            resolve();
          }
        });

        const server = new WebpackDevServer(
          {
            hot: true,
            client: {
              overlay: true,
              progress: true
            },
            static: {
              directory: path.join(__dirname, '../dist/electron')
            },
            headers: { 'Access-Control-Allow-Origin': '*' },
            host: 'localhost',
            port: 9080,
            setupMiddlewares: (middlewares, devServer) => {
              devServer.app.use(hotMiddleware);
              middlewares.push(hotMiddleware);
              return middlewares;
            }
          },
          compiler
        );

        server.listen(9080, 'localhost');
      });
    }

    async function startMain () {
      mainConfig.mode = 'development';

      const compiler = webpack(mainConfig);

      compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
        logStats('Main', 'compiling...');
        done();
      });

      compiler.watch({}, (err, stats) => {
        if (err) {
          console.log(err);
          return;
        }

        logStats('Main', stats);

        if (electronProcess && electronProcess.kill) {
          manualRestart = true;
          process.kill(electronProcess.pid);
          electronProcess = null;
          startElectron();

          setTimeout(() => {
            manualRestart = false;
          }, 5000);
        }
      });
    }

    function startElectron () {
      electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')]);

      electronProcess.stdout.on('data', data => {
        electronLog(data, 'blue');
      });

      electronProcess.stderr.on('data', data => {
        electronLog(data, 'red');
      });

      electronProcess.on('close', () => {
        if (!manualRestart) process.exit();
      });
    }

    function electronLog (data, color) {
      let log = '';

      data = data.toString().split(/\r?\n/);
      data.forEach(line => {
        log += `  ${line}\n`;
      });

      if (/[0-9A-z]+/.test(log)) {
        console.log(chalk.default[color].bold('┏ Electron -------------------') + '\n\n' + log + chalk.default[color].bold('┗ ----------------------------') + '\n');
      }
    }

    function greeting () {
      const cols = process.stdout.columns;
      let text = '';

      if (cols > 104) text = 'electron-vue';
      else if (cols > 76) text = 'electron-|vue';
      else text = false;

      if (text) {
        say(text, {
          colors: ['yellow'],
          font: 'simple3d',
          space: false
        });
      } else console.log(chalk.default.yellow.bold('\n  electron-vue'));  

      console.log(chalk.default.blue.bold('\n  getting ready...') + '\n');
    }

    function init () {
      greeting();

      Promise.all([startRenderer(), startMain()])
        .then(() => {
          startElectron();
        })
        .catch(err => {
          console.error(err);
        });
    }

    init();
  } catch (err) {
    console.error(err);
  }
})();
