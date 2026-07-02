"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolsModule = void 0;
const common_1 = require("@nestjs/common");
const protocols_controller_1 = require("./protocols.controller");
const protocols_service_1 = require("./protocols.service");
let ProtocolsModule = class ProtocolsModule {
};
exports.ProtocolsModule = ProtocolsModule;
exports.ProtocolsModule = ProtocolsModule = __decorate([
    (0, common_1.Module)({
        controllers: [protocols_controller_1.ProtocolsController],
        providers: [protocols_service_1.ProtocolsService],
        exports: [protocols_service_1.ProtocolsService],
    })
], ProtocolsModule);
//# sourceMappingURL=protocols.module.js.map