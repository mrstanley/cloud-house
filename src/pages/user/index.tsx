declare function require(moduleName: string): any;
declare const plus;
interface HTMLAttributes {
    onTap: any
}


import "./index.scss";
import { h, Component } from "preact";
import { showPage, hideScroll, setSettings, getSettings, setCookie, getCookie } from "../../public/common/util";
import { REMOTE } from "../../public/config"

const mui = require("mui");
const layer = require("layer");
const md5 = require("js-md5");

export interface AppProps {
    name: string;
}
interface AppState {
    loginName: string;
    displayName: string;
    password: string;
    loginEnable: boolean;
    isLogin: boolean;
}

export class User extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        const { loginName, displayName } = getSettings("user");
        this.setState({
            isLogin: !!getCookie("access_token"),
            loginName, displayName
        });
    }
    componentWillMount() {
        plus.navigator.setStatusBarStyle("light");
        hideScroll();
        mui.back = () => {
            plus.navigator.setStatusBarStyle("dark");
            plus.webview.currentWebview().close();
        }
        window.addEventListener("changeState", () => {
            this.setState({
                isLogin: false
            });
        })
    }
    handleLogin() {
        const { password, loginName } = this.state;
        plus.nativeUI.showWaiting("登录中...");

        mui.ajax(REMOTE + "account/login", {
            data: { password: md5(password), loginName },
            type: 'post',
            headers: { 'Content-Type': 'application/json' },
            success: (res) => {
                if (res.success && res.data) {
                    setSettings("user", res.data);
                    setSettings("expires", new Date().getTime() + 1800 * 1000);
                    setCookie("access_token", res.data.access_token, 1800);
                    mui.fire(plus.webview.getLaunchWebview(), "getUserDevices");
                    mui.fire(plus.webview.getLaunchWebview(), "showMsg");
                    mui.later(() => {
                        mui.toast("登录成功");
                        this.setState({
                            isLogin: true,
                            displayName: res.data.displayName,
                            loginName: res.data.loginName
                        });
                        plus.nativeUI.closeWaiting();
                        mui.back();
                    }, 1000);
                } else {
                    mui.toast(res.code === 1008 ? "登录密码错误" : "登录失败，请重试");
                    plus.nativeUI.closeWaiting();
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("登录出错");
                plus.nativeUI.closeWaiting();
            }
        });
    }
    handleValueChange(event) {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ "loginEnable": !!this.state.loginName && !!this.state.password && this.state.password.length >= 6 });
    }
    handleLogout() {
        plus.nativeUI.confirm("确定要退出登录？", (e) => {
            if (e.index === 0) {
                setCookie("access_token", " ", 0.001);
                setSettings("expires", "");
                this.setState({
                    isLogin: false
                });
            }
        });
    }
    render(props: AppProps, state: AppState) {
        return (
            <section id="user">
                <header className="header">
                    <div className="avatar"></div>
                    <div className="close" {...{ onTap: mui.back }}></div>
                </header>
                <section className="content">
                    <div className="title">
                        <h1>{state.isLogin ? state.displayName || '管理员' : '欢迎回来'}</h1>
                        {state.isLogin &&
                            <div>我的用户名：{state.loginName}</div>
                        }
                    </div>
                    {state.isLogin &&
                        <ul className="opt">
                            <li className="" {...{ onTap: () => showPage("resetPwd") }}><img src={require('../../public/images/mine_icon_pas@3x.png')} alt="" /> 修改密码</li>
                            <li className="" {...{ onTap: this.handleLogout.bind(this) }}><img src={require('../../public/images/mine_icon_esi@3x.png')} alt="" /> 退出登录</li>
                        </ul>
                    }
                    {!state.isLogin &&
                        <div className="login">
                            <input type="text" value={state.loginName} onKeyUp={this.handleValueChange.bind(this)} name="loginName" placeholder="请输入用户名" />
                            <input type="password" value={state.password} onKeyUp={this.handleValueChange.bind(this)} name="password" placeholder="请输入登录密码" />
                            <div className={state.loginEnable ? 'submit' : 'submit mui-disabled'} {...{ onTap: this.handleLogin.bind(this) }} >登录</div>
                        </div>
                    }
                </section>
                {!state.isLogin &&
                    <p className="notice">
                        若忘记登录密码请联系云生有家管理员重置密码<br />
                        联系方式：<a href="tel:028-872637">028-872637</a>
                    </p>
                }
            </section>
        );
    }
}
