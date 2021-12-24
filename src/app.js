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
        while (_) try {
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
var express = require("express");
var cors = require("cors");
var amqp = require("amqplib");
var typeorm_1 = require("typeorm");
var product_1 = require("./entity/product");
require("reflect-metadata");
(0, typeorm_1.createConnection)().then(function (db) { return __awaiter(void 0, void 0, void 0, function () {
    var productRespository, connection_1, channel_1, app, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                productRespository = db.getRepository(product_1.Product);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, amqp.connect('amqps://lkgdchtg:QC6oAndiH8qjdCd3FOV-mAAW47y4fvLm@fox.rmq.cloudamqp.com/lkgdchtg')];
            case 2:
                connection_1 = _a.sent();
                return [4 /*yield*/, connection_1.createChannel()];
            case 3:
                channel_1 = _a.sent();
                app = express();
                app.use(cors({
                    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
                }));
                app.use(express.json());
                app.get('/api/products', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var products;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRespository.find()];
                            case 1:
                                products = _a.sent();
                                res.status(200).json(products);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.post('/api/products', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var product, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                product = productRespository.create(req.body);
                                return [4 /*yield*/, productRespository.save(product)];
                            case 1:
                                result = _a.sent();
                                channel_1.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
                                res.status(201).json(result);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.get('/api/products/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var product;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRespository.findOne(req.params.id)];
                            case 1:
                                product = _a.sent();
                                if (!product) {
                                    res.status(404).send("Product not found");
                                }
                                res.status(200).json(product);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.put('/api/products/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var product, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRespository.findOne(req.params.id)];
                            case 1:
                                product = _a.sent();
                                if (!product) {
                                    res.status(404).send("Product not found");
                                }
                                productRespository.merge(product, req.body);
                                return [4 /*yield*/, productRespository.save(product)];
                            case 2:
                                result = _a.sent();
                                channel_1.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
                                res.status(200).json(result);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.delete('/api/products/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRespository.delete(req.params.id)];
                            case 1:
                                result = _a.sent();
                                channel_1.sendToQueue('product_deleted', Buffer.from(JSON.stringify(req.params.id)));
                                res.status(200).send("ok");
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.patch('/api/products/:id/like', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var product, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRespository.findOne(req.params.id)];
                            case 1:
                                product = _a.sent();
                                if (!product) {
                                    res.status(404).send("Product not found");
                                }
                                product.likes = product.likes + 1;
                                return [4 /*yield*/, productRespository.save(product)];
                            case 2:
                                result = _a.sent();
                                res.status(200).json(result);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.listen(8000, function () { return console.log('Server started at localhost:8000'); });
                process.on('beforeExit', function () {
                    console.log('closing');
                    connection_1.close();
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); });
