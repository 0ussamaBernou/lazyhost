import { program } from 'commander';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import localtunnel from 'localtunnel';
import ngrok from 'ngrok';
import ip from 'ip';
import chalk from 'chalk';

const startReverseProxy = (port: number, targetPort: number) => {
  const app = express();
  app.use('/', createProxyMiddleware({ target: `http://localhost:${targetPort}`, changeOrigin: true }));
  app.listen(port, '0.0.0.0', () => {
    console.log(chalk.green(`Reverse proxy started on http://${ip.address()}:${port}`));
    console.log(chalk.yellow(`Forwarding to http://localhost:${targetPort}`));
  });
};

const startNgrokTunnel = async (port: number) => {
  try {
    const url = await ngrok.connect(port);
    console.log(chalk.blue(`ngrok tunnel started on ${url}`));
    return url;
  } catch (err) {
    console.error(chalk.red('Failed to start ngrok tunnel:'), err);
  }
};

const startLocaltunnel = async (port: number) => {
  const tunnel = await localtunnel({ port });
  console.log(chalk.blue(`localtunnel Tunnel started on ${tunnel.url}`));
  tunnel.on('close', () => {
    console.log(chalk.red('localtunnel Tunnel closed'));
  });
};

program
  .version('1.0.0')
  .description('A CLI tool for reverse proxy and localtunnel Tunnels')
  .option('-p, --port <number>', 'Port to run the reverse proxy on', '8080')
  .option('-t, --target <number>', 'Target port of the localhost server', '3000')
  .option('-l, --localtunnel', 'Start a Localtunnel tunnel')
  .option('-n, --ngrok', 'Start an ngrok tunnel')
  .action(async (options) => {
    const port = parseInt(options.port);
    const targetPort = parseInt(options.target);

    startReverseProxy(port, targetPort);

    if (options.ngrok) {
      await startNgrokTunnel(port);
    }

    if (options.localtunnel) {
      await startLocaltunnel(port);
    }
  });

program.parse(process.argv);
