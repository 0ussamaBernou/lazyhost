"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var express_1 = require("express");
var http_proxy_middleware_1 = require("http-proxy-middleware");
var localtunnel_1 = require("localtunnel");
var ngrok_1 = require("ngrok");
var ip_1 = require("ip");
var chalk_1 = require("chalk");
var startReverseProxy = function (port, targetPort) {
    var app = (0, express_1.default)();
    app.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: "http://localhost:".concat(targetPort), changeOrigin: true }));
    app.listen(port, '0.0.0.0', function () {
        console.log(chalk_1.default.green("Reverse proxy started on http://".concat(ip_1.default.address(), ":").concat(port)));
        console.log(chalk_1.default.yellow("Forwarding to http://localhost:".concat(targetPort)));
    });
};
var startNgrokTunnel = function (port) { return __awaiter(void 0, void 0, void 0, function () {
    var url, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ngrok_1.default.connect(port)];
            case 1:
                url = _a.sent();
                console.log(chalk_1.default.blue("ngrok tunnel started on ".concat(url)));
                return [2 /*return*/, url];
            case 2:
                err_1 = _a.sent();
                console.error(chalk_1.default.red('Failed to start ngrok tunnel:'), err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var startLocaltunnel = function (port) { return __awaiter(void 0, void 0, void 0, function () {
    var tunnel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, localtunnel_1.default)({ port: port })];
            case 1:
                tunnel = _a.sent();
                console.log(chalk_1.default.blue("localtunnel Tunnel started on ".concat(tunnel.url)));
                tunnel.on('close', function () {
                    console.log(chalk_1.default.red('localtunnel Tunnel closed'));
                });
                return [2 /*return*/];
        }
    });
}); };
commander_1.program
    .version('1.0.0')
    .description('A CLI tool for reverse proxy and localtunnel Tunnels')
    .option('-p, --port <number>', 'Port to run the reverse proxy on', '8080')
    .option('-t, --target <number>', 'Target port of the localhost server', '3000')
    .option('-l, --localtunnel', 'Start a Localtunnel tunnel')
    .option('-n, --ngrok', 'Start an ngrok tunnel')
    .action(function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var port, targetPort;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                port = parseInt(options.port);
                targetPort = parseInt(options.target);
                startReverseProxy(port, targetPort);
                if (!options.ngrok) return [3 /*break*/, 2];
                return [4 /*yield*/, startNgrokTunnel(port)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                if (!options.localtunnel) return [3 /*break*/, 4];
                return [4 /*yield*/, startLocaltunnel(port)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
commander_1.program.parse(process.argv);
