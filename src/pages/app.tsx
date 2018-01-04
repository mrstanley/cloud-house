declare function require(moduleName: string): any;
declare const plus;

import "./app.scss";
const flexible = require("flexible");
const mui = require("mui");
import { h, render } from "preact";
import { App } from "./index";
import { User } from "./user";
import { Nearby } from "./nearby";
import { ResetPwd } from "./resetPwd";
import { DeviceDetail } from "./deviceDetail";
import { UserInfo } from "./userInfo";

import {
    Px, getImmersed, showPage, appBack,
    currentAppendSubView, createImgBtnView,
    hideScroll, getCookie
} from "../public/common/util";
import { REMOTE } from "../public/config";

mui.plusReady(() => {
    const currentView = plus.webview.currentWebview();
    const token = getCookie("access_token");
    mui.later(() => {
        if (currentView.id === "H5698AEEA" || currentView.id === "HBuilder") {
            createView(currentView);
            appBack();
            hideScroll();
            plus.navigator.setFullscreen(false);
            plus.navigator.setStatusBarStyle("dark");
            plus.navigator.closeSplashscreen();
            if (token) {
                getMsg(currentView, token);
            } else {
                mui.toast("请登录获取设备");
                creatMsgNotice(currentView, false);
            }
            window.addEventListener("showMsg", () => {
                const token = getCookie("access_token");
                getMsg(currentView, token);
            });
        }
    }, 2000);
    render(Pages[currentView.id], document.body);
});


function getMsg(currentView, token) {
    mui.ajax(REMOTE + "device/page/0/10000", {
        data: {
            onlineState: false
        },
        type: 'post',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token
        },
        success(res) {
            if (res.success && res.data.content.length) {
                creatMsgNotice(currentView, true);
            } else {
                mui.toast("获取设备列表失败，请重试");
                creatMsgNotice(currentView, false);
            }
        },
        error(xhr, type, errorThrown) {
            mui.toast("获取设备列表出错，请重试");
            creatMsgNotice(currentView, false);
        }
    });
}


const Pages = {
    "HBuilder": <App name="hello word" />,
    "H5698AEEA": <App name="hello word" />,
    "user": <User name="hello word" />,
    "nearby": <Nearby />,
    "deviceDetail": <DeviceDetail />,
    "resetPwd": <ResetPwd />,
    "userInfo": <UserInfo />
};


function creatMsgNotice(currentView, hasMsg) {
    const msgOnlineBtn = plus.nativeObj.View.getViewById("msgOnlineBtn") || createImgBtnView('msgOnlineBtn', { bottom: Px(44), left: Px(626), height: Px(96), width: Px(96) }, require('../public/images/msgOnline@3x.png'));
    const offBtn = createImgBtnView('offBtn', { bottom: Px(64), left: Px(650), height: Px(60), width: Px(60) }, require('../public/images/down@3x.png'));

    if (hasMsg) {
        msgOnlineBtn.drawRect({ radius: Px(16), color: '#ff2727' }, { width: Px(16), height: Px(16), left: Px(54), bottom: Px(64) }, 'msgActive');
        msgOnlineBtn.addEventListener('click', () => {
            msgOutLine.show();
            offBtn.show();
            msgOnlineBtn.hide();
        });
    } else {
        msgOnlineBtn.addEventListener('click', () => {
            if (!getCookie("access_token")) {
                showPage("user");
            }
        });
    }

    const msgOutLine = new plus.nativeObj.View('msgOutLine', { bottom: Px(152), left: Px(384), height: Px(80), width: Px(326) }, [
        { tag: 'rect', id: 'msgOutLineRect', rectStyles: { color: '#595959', radius: Px(45) } },
        { tag: 'img', id: 'msgOutLineImg', src: require('../public/images/msgOutline@3x.png'), position: { top: Px(26), left: Px(18), width: Px(30.4), height: Px(28.8) } },
        { tag: 'font', id: 'msgOutLineFont', text: '有设备已离线，请核实', position: { left: Px(60) }, textStyles: { align: 'left', color: '#ffffff', size: Px(24) } }
    ]);

    msgOutLine.hide();
    offBtn.hide();

    offBtn.addEventListener('click', () => {
        msgOnlineBtn.show();
        msgOutLine.hide();
        offBtn.hide();
    });

    currentAppendSubView(currentView, [
        msgOutLine,
        offBtn,
        msgOnlineBtn
    ]);

}


function createView(currentView) {
    const topoffset = getImmersed();
    const titleView = new plus.nativeObj.View('titleView', { top: '0', left: '0', height: Px(140), width: '100%', backgroundColor: '#fff', opacity: 0.7 });

    const logo = createImgBtnView('logo', { top: Px(32 + topoffset), left: Px(40), width: Px(248), height: Px(60) }, require('../public/images/logo@3x.png'));
    const searchBtn = createImgBtnView('searchBtn', { top: Px(26 + topoffset), left: Px(638), width: Px(84), height: Px(84) }, require('../public/images/search@3x.png'));
    const localBtn = createImgBtnView('localBtn', { bottom: Px(44), left: Px(28), height: Px(96), width: Px(96) }, require('../public/images/loc@3x.png'));
    const userBtn: HTMLElement = createImgBtnView('userBtn', { bottom: Px(146), left: Px(28), height: Px(96), width: Px(96) }, require('../public/images/user@3x.png'));

    // const msgOnlineBtn = createImgBtnView('msgOnlineBtn', { bottom: Px(44), left: Px(626), height: Px(96), width: Px(96) }, require('../public/images/msgOnline@3x.png'));
    // msgOnlineBtn.reset();

    userBtn.addEventListener('click', () => {
        showPage('user');
    }, false);

    searchBtn.addEventListener('click', () => {
        showPage(getCookie("access_token") ? 'nearby' : 'user');
    }, false);

    localBtn.addEventListener('click', () => {
        mui.fire(currentView, 'getUserLocation', {});
        mui.toast("当前用户定位中...", {
            duration: 3000
        })
    });

    currentAppendSubView(currentView, [
        titleView,
        logo,
        searchBtn,
        localBtn,
        userBtn
    ]);
}