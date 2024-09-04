import inquirer from "inquirer";
import { program } from "commander";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import localtunnel from "localtunnel";
import ngrok from "ngrok";
import ip from "ip";
import chalk from "chalk";
import qrcode from "qrcode";

const generateQRCode = async (text, label) => {
  try {
    const url = await qrcode.toString(text, { type: "terminal" });
    console.log(chalk.green(`${label} QR Code:`));
    console.log(url);
  } catch (err) {
    console.error(chalk.red("Failed to generate QR Code:"), err);
  }
};

const startReverseProxy = (port, targetPort) => {
  const app = express();
  app.use(
    "/",
    createProxyMiddleware({
      target: `http://localhost:${targetPort}`,
      changeOrigin: true,
    }),
  );
  app.listen(port, "0.0.0.0", async () => {
    const localAddress = `http://${ip.address()}:${port}`;
    console.log(chalk.green(`Reverse proxy started on ${localAddress}`));
    console.log(chalk.yellow(`Forwarding to http://localhost:${targetPort}`));
    await generateQRCode(localAddress, "Local Address");
  });
};

const startNgrokTunnel = async (port) => {
  try {
    const url = await ngrok.connect(port);
    console.log(chalk.blue(`ngrok tunnel started on ${url}`));
    await generateQRCode(url, "ngrok Tunnel");
    return url;
  } catch (err) {
    console.error(chalk.red("Failed to start ngrok tunnel:"), err);
  }
};

const startLocaltunnel = async (port) => {
  const tunnel = await localtunnel({ port });
  console.log(chalk.blue(`localtunnel Tunnel started on ${tunnel.url}`));
  await generateQRCode(tunnel.url, "localtunnel Tunnel");
  tunnel.on("close", () => {
    console.log(chalk.red("localtunnel Tunnel closed"));
  });
};

program
  .version("1.0.0")
  .description("A CLI tool for reverse proxy and localtunnel/ngrok Tunnels")
  .option("-p, --port <number>", "Port to run the reverse proxy on")
  .option("-t, --target <number>", "Target port of the localhost server")
  .option("-l, --localtunnel", "Start a Localtunnel tunnel")
  .option("-n, --ngrok", "Start an ngrok tunnel")
  .action(async (options) => {
    let port, targetPort;
    if (!options.port || !options.target) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "port",
          message: "Enter the port to run the reverse proxy on:",
          default: "8080",
          validate: (input) =>
            !isNaN(parseInt(input)) || "Please enter a valid number",
        },
        {
          type: "input",
          name: "targetPort",
          message: "Enter the target port of the localhost server:",
          default: "3000",
          validate: (input) =>
            !isNaN(parseInt(input)) || "Please enter a valid number",
        },
      ]);
      port = parseInt(answers.port);
      targetPort = parseInt(answers.targetPort);
    } else {
      port = parseInt(options.port);
      targetPort = parseInt(options.target);
    }
    startReverseProxy(port, targetPort);

    if (options.ngrok) {
      await startNgrokTunnel(port);
    }

    if (options.localtunnel) {
      await startLocaltunnel(port);
    }
  });

program.parse(process.argv);
