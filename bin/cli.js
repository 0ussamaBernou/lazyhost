#!/usr/bin/env node

import inquirer from "inquirer";
import { program } from "commander";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import localtunnel from "localtunnel";
import ip from "ip";
import chalk from "chalk";
import qrcode from "qrcode";
import boxen from "boxen";
import process from "process";
import { readFileSync } from "fs";
import { join } from "path";

function getPackageVersion() {
  const __dirname = new URL('..', import.meta.url).pathname;
  return JSON
    .parse(readFileSync(join(__dirname, "package.json"), "utf-8"))
    .version;
}
const useragent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

process.on("SIGINT", () => {
  console.log(chalk.red("\nProcess interrupted. Exiting..."));
  process.exit();
});

process.on("SIGTERM", () => {
  console.log(chalk.red("\nProcess terminated. Exiting..."));
  process.exit();
});

const generateQRCode = async (text, label) => {
  try {
    const url = await qrcode.toString(text, { type: "terminal", small: true });
    // url = url
    //   .split("\n")
    //   .map((line) =>
    //     line.padStart((process.stdout.columns - line.length) / 2 + line.length),
    //   )
    //   .join("\n");
    console.log(chalk.green(`${label} QR Code:`));
    console.log(boxen(url, { padding: 1, borderColor: "green" }));
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
    console.log(chalk.yellow(`Forwarding http://localhost:${targetPort}`));
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
  fetch("https://loca.lt/mytunnelpassword", {
    headers: { UserAgent: useragent },
  })
    .then((res) => res.text())
    .then((password) => {
      console.log(chalk.yellow(`Tunnel password: ${password}`));
    });
  tunnel.on("close", () => {
    console.log(chalk.red("localtunnel Tunnel closed"));
  });
};

program
  .version(getPackageVersion())
  .description("A CLI tool for reverse proxy and localtunnel Tunnels")
  .option("-p, --port <number>", "Port to run the reverse proxy on")
  .option("-t, --target <number>", "Target port of the localhost server")
  .option("-l, --localtunnel", "Start a Localtunnel tunnel")
  .action(async (options) => {
    const logo = `
  _                    _   _           _   
 | |    __ _ _____   _| | | | ___  ___| |_ 
 | |   / _  |_  / | | | |_| |/ _ \/ __| __|
 | |__| (_| |/ /| |_| |  _  | (_) \__ \ |_ 
 |_____\__,_/___|\__, |_| |_|\___/|___/\__|
                 |___/                     
`;
    console.log(chalk.green(logo));
    let useLocaltunnel, port, targetPort;
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
        {
          type: "confirm",
          name: "localtunnel",
          message:
            "Do you want to use localtunnel(accessible outside your network)?",
          default: false,
        },
      ]);
      port = parseInt(answers.port);
      targetPort = parseInt(answers.targetPort);
      useLocaltunnel = answers.localtunnel;
    } else {
      port = parseInt(options.port);
      targetPort = parseInt(options.target);
    }
    startReverseProxy(port, targetPort);

    if (options.localtunnel || useLocaltunnel) {
      await startLocaltunnel(port);
    }
  });

program.parse(process.argv);
