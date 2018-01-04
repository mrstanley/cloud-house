declare function require(moduleName: string): any;
declare const plus;

import "./index.scss";
import { h, Component } from "preact";
import { showPage, setImmersed, hideScroll, getSettings, setSettings, getCookie, setCookie } from "../../public/common/util";
import { REMOTE } from "../../public/config"

const mui = require("mui");
const md5 = require("js-md5");


export interface AppProps { }
interface AppState {
    oldPwd: string;
    password: string;
    repeatPwd: string;
    subEable: boolean;
    displayName: string;
    id: string;
}

export class ResetPwd extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
    }
    componentWillMount() {
        hideScroll();
        const { displayName, id } = getSettings("user");
        this.setState({
            displayName,
            id
        });
    }
    componentDidMount() {
        setImmersed();
    }
    handleValueChange(event) {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ subEable: !!this.state.oldPwd && !!this.state.password && this.state.password.length >= 6 && this.state.password === this.state.repeatPwd });
    }
    handleSubmit() {
        plus.nativeUI.confirm("确定修改密码？", (e) => {
            if (e.index === 0) {
                const { password, id } = this.state;
                plus.nativeUI.showWaiting("修改中...");
                mui.ajax(REMOTE + "account/modifyPasswd", {
                    data: { newPassword: password, id },
                    type: 'post',
                    headers: { 'Content-Type': 'application/json', "access_token": getCookie("access_token") },
                    success: (res) => {
                        if (res.success) {
                            mui.later(() => {
                                setCookie("access_token", " ", 0.001);
                                setSettings("expires", "");
                                mui.fire(plus.webview.currentWebview().opener(), "changeState")
                                mui.later(() => {
                                    mui.toast("修改成功");
                                    plus.nativeUI.closeWaiting();
                                    mui.back();
                                }, 1000);
                            }, 800);
                        } else {
                            mui.toast("修改密码失败");
                            plus.nativeUI.closeWaiting();
                        }
                    },
                    error: (xhr, type, errorThrown) => {
                        mui.toast("修改密码出错");
                        plus.nativeUI.closeWaiting();
                    }
                });
            }
        });
    }
    render(props: AppProps, state: AppState) {
        return (
            <section id="resetPwd">
                <header class="mui-bar">
                    <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
                    <h1 class="mui-title">修改密码</h1>
                    <button className="mui-btn mui-btn-blue mui-btn-link mui-pull-right mui-hidden">保存</button>
                </header>
                <section className="mui-content">
                    <div className="login">
                        <p className="notice">我的用户名：{state.displayName}</p>
                        <input type="password" value={state.oldPwd} onKeyUp={this.handleValueChange.bind(this)} name="oldPwd" placeholder="请输入原始登录密码" />
                        <input type="password" value={state.password} onKeyUp={this.handleValueChange.bind(this)} name="password" placeholder="请输入新登录密码" />
                        <input type="password" value={state.repeatPwd} onKeyUp={this.handleValueChange.bind(this)} name="repeatPwd" placeholder="请确认新登录密码" />
                        <p className="notice">密码为6-20位数字、字母或下划线的组合</p>
                        <div className={state.subEable ? 'submit' : 'submit mui-disabled'} {...{ onTap: this.handleSubmit.bind(this) }} >提交修改</div>
                    </div>
                </section>
            </section>
        );
    }
}
