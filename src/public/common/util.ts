declare function require(moduleName: string): any;
declare const plus;

import { ROOT, REMOTE } from "../config"

const mui = require("mui");

export function Px(a: number): string {
    const PX = Math.ceil(a * (plus.screen.resolutionWidth / 750));
    return PX + 'px';
}

// 判断是否全屏，返回状态栏高度
export function getImmersed() {
    let immersed = 0;
    const ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
    if (ms && ms.length >= 3) {
        immersed = parseFloat(ms[2]);
    }
    if (immersed) {
        return immersed;
    } else if (plus.navigator.isImmersedStatusbar()) {
        return plus.navigator.getStatusbarHeight();
    } else {
        return 0;
    }
}

// 初始化安卓手机返回按钮行为
export function appBack(): void {
    let first: number = 0;
    mui.back = () => {
        if (!first) {
            mui.toast("再按一次退出");
            first++;
            setTimeout(() => {
                first = 0;
            }, 1500);
        } else {
            plus.runtime.quit();
        }
    };
}
// 向当前webView添加原生view
export function currentAppendSubView(currentView: object | any, views: object[]) {
    views.forEach((item) => {
        currentView.append(item);
    })
}

// 添加图片控件
export function createImgBtnView(id, styles, url) {
    return new plus.nativeObj.View(id, styles, [
        { tag: 'img', id: id + 'Img', src: url },
    ]);
}

/**
 * @description 打开新页面如果页面已经打开，则显示页面
 * @param {String|Object} 要打开页面的ID
 */
export function showPage(page: string, param: any = {}, showedCB?): void {
    const tmp = plus.webview.getWebviewById(page);
    const ios = plus.os.name.toLowerCase() === "ios";
    const moveType = ios ? "pop-in" : "slide-in-right";
    if (tmp && !param.createNew) {
        tmp.show(moveType, 250, showedCB);
    } else {
        const options: any = {
            url: "index.html",
            id: param.createNew ? "new_" + page : page,
            show: {
                aniShow: moveType,
                duration: 250,
                event: "loaded"
            },
            styles: {
                hardwareAccelerated: true,
                popGesture: "close"
            },
            waiting: {
                autoShow: false
            },
            extras: param
        };
        param.createNew && (options.createNew = true);
        mui.openWindow(options);
    }
}

export function getRootSize() {
    return Math.ceil(window.screen.availWidth / 7.5);
}

/**
 * @description 顶部状态栏高度 区分首页和内页不同处理
 * @param {String|null} str 顶部状态栏颜色
 */
export function setImmersed() {
    const r = getRootSize();
    const immersed = getImmersed();
    if (immersed) {
        let t: Element | any = (document.querySelector(".mui-bar") || document.querySelector(".app-header"));
        t && (t.style.paddingTop = immersed + "px", t.style.height = (.9 * r + immersed) + "px");
        t = document.querySelector(".mui-content") || document.querySelector(".app-content");
        t && (t.style.paddingTop = (.9 * r + immersed) + "px");
    }
}


// 隐藏滚动条
export function hideScroll() {
    plus.webview.currentWebview().setStyle({
        scrollIndicator: "none"
    });
}

// 存取 cookie
export function setCookie(key: string, value: any, time?: number): void {
    const expires: any = new Date(Date.now() + (time || 86400) * 1000);
    key && value && plus.navigator.setCookie(ROOT, key + "=" + value + "; expires=" + expires.toGMTString().replace(" ", "") + "; path=/");
}
export function getCookie(key: string): string {
    const cookieStr = plus.navigator.getCookie(ROOT);
    const cookieArray = cookieStr && cookieStr.split("; ");
    const cookieValue = cookieArray && cookieArray.find((i) => i.indexOf(key) >= 0);
    if (cookieValue) {
        return cookieValue.split("=")[1];
    } else {
        return key ? "" : plus.navigator.getCookie(ROOT);
    }
}

// 存取数据
export function setSettings(attr: string, val: any): void {
    const settings = getSettings();
    attr && JSON.stringify(val) ? settings[attr] = val : "";
    plus.storage.setItem("DATA_SETTING", JSON.stringify(settings));
}
export function getSettings(attr?: string) {
    const settingsText = plus.storage.getItem("DATA_SETTING") || "{}";
    return (attr && typeof attr === "string" ? (JSON.parse(settingsText)[attr] || '') : JSON.parse(settingsText));
}

export class DrawBabbleImg {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D | null;
    constructor() {
        var scale = plus.screen.scale;
        var isIos = plus.os.name === 'iOS';
        this.canvas = document.createElement('canvas');
        this.canvas.width = isIos ? 700 / (scale + 1) : 700;
        this.canvas.height = isIos ? 150 / (scale + 1) : 150;
        this.ctx = this.canvas.getContext("2d");
    }
    draw(num, address) {
        var x = 3, y = 3, width = 690, height = 130, radius = 5;
        const ctx: CanvasRenderingContext2D | any = this.ctx;
        this.clear();
        ctx.strokeStyle = "#999";
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineWidth = 4;
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width / 2 - 18, y + height);
        ctx.lineTo(x + width / 2, y + height + 16);
        ctx.lineTo(x + width / 2 + 18, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
        ctx.fillStyle = "#fafafa";
        ctx.fill("evenodd");
        ctx.fillStyle = "#444";
        ctx.font = "34px serif";
        ctx.fillText("设备编号：" + num, 20, 55);
        ctx.fillText("设备地址：" + address, 20, 105);
        return this.canvas.toDataURL('image/jpg');
    }
    iosDraw(num, address) {
        var scale = plus.screen.scale;
        var x = 3 / (scale + 1), y = 3 / (scale + 1), width = 690 / (scale + 1), height = 130 / (scale + 1), radius = 5 / (scale + 1);
        const ctx: CanvasRenderingContext2D | any = this.ctx;
        this.clear();
        ctx.strokeStyle = "#999";
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineWidth = 4;
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width / 2 - 18 / (scale + 1), y + height);
        ctx.lineTo(x + width / 2, y + height + 16 / (scale + 1));
        ctx.lineTo(x + width / 2 + 18 / (scale + 1), y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
        ctx.fillStyle = "#fafafa";
        ctx.fill("evenodd");
        ctx.fillStyle = "#444";
        ctx.font = 34 / (scale + 1) + "px serif";
        ctx.fillText("设备编号：" + num, 20 / (scale + 1), 55 / (scale + 1));
        ctx.fillText("设备地址：" + address, 20 / (scale + 1), 105 / (scale + 1));
        return this.canvas.toDataURL('image/jpg');
    }
    clear() {
        const ctx: CanvasRenderingContext2D | any = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}