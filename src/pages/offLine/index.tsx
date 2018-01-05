declare function require(moduleName: string): any;
declare const plus;
interface HTMLAttributes {
    onTap: any
}


import "./index.scss";
import { h, Component } from "preact";
import { showPage, hideScroll, setSettings, setImmersed, getSettings, setCookie, getCookie } from "../../public/common/util";
import { REMOTE } from "../../public/config"

const mui = require("mui");
let token;

export interface AppProps {

}

interface AppState {
    key: string;
    loading: boolean;
    devices: object[];
    users: object[];
    histories: boolean;
    type: string;
    historiesList: string[];
}

export class OffLine extends Component<AppProps, AppState> {
    public searchInput: HTMLInputElement | any;
    constructor(props: AppProps) {
        super(props);
        this.setState({ type: 'device', devices: [], users: [], loading: true, histories: false, historiesList: getSettings('searchHistories') || [] });
    }
    componentWillMount() {
        hideScroll();
        token = getCookie("access_token");
        const Bounds = getSettings("currentBounds");
        plus.navigator.setStatusBarStyle("light");
        Bounds ? this.getDevicesList(getSettings("currentBounds")) : this.setState({ loading: false });
        mui.back = () => {
            plus.navigator.setStatusBarStyle("dark");
            plus.webview.currentWebview().close();
        }
    }
    componentDidMount() {
        setImmersed();
        this.searchInput.addEventListener("focus", () => {
            this.setState({ histories: true });
        });
        this.searchInput.addEventListener("blur", () => {
            this.setState({ histories: false });
        });
    }
    handleKeyChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }
    handleSearch(ev: Event) {
        ev.stopPropagation();
        ev.preventDefault();
        const key = this.state.key;
        if (key) {
            const list: string[] = this.state.historiesList;
            if (list.indexOf(key) < 0) {
                list.unshift(key);
                this.setState({ historiesList: list });
                setSettings("searchHistories", list);
            }
            this.searchInfo(key);
        } else {
            mui.toast("查询关键字不能为空");
        }
    }
    getDevicesList(point) {
        setSettings("currentBounds", point);
        const data = {
            ownerId: "1",
            onlineState: false,            
            nearBy: [
                { y: point.northease.longitude, x: point.northease.latitude },
                { y: point.southwest.longitude, x: point.southwest.latitude }
            ]
        };
        mui.ajax(REMOTE + "device/page/0/10000", {
            data,
            type: 'post',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token
            },
            success: (res) => {
                if (res.success && res.data) {
                    this.setState({ devices: res.data.content, loading: false });
                } else {
                    mui.toast("获取设备列表失败，请重试");
                    this.setState({ loading: false });
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("获取设备列表出错，请重试");
                this.setState({ loading: false });
            }
        });
    }
    clear(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.state.key) {
            this.setState({ key: "" });
        }
    }
    showDeviceDetail(deviceId) {
        return function () {
            showPage("deviceDetail", { deviceId });
        }
    }
    handleHistory(key: string) {
        return () => {
            this.setState({ key });
            this.searchInfo(key);
        }
    }
    getByUser(query: string) {
        mui.ajax(REMOTE + "user/list/0/100", {
            data: {
                query
            },
            type: 'post',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token
            },
            success: (res) => {
                if (res.success && res.data) {
                    this.setState({ users: res.data.content, loading: false });
                } else {
                    mui.toast("查询用户列表失败，请重试");
                    this.setState({ loading: false });
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("查询用户列表出错，请重试");
                this.setState({ loading: false });
            }
        });
    }
    getByAdress(address) {
        mui.ajax(REMOTE + "device/page/0/100", {
            data: {
                address
            },
            type: 'post',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token
            },
            success: (res) => {
                if (res.success && res.data) {
                    this.setState({ devices: res.data.content, loading: false });
                } else {
                    mui.toast("查询用户列表失败，请重试");
                    this.setState({ loading: false });
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("查询用户列表出错，请重试");
                this.setState({ loading: false });
            }
        });
    }
    searchInfo(key) {
        var btnArray = [{ title: "设备信息" }, { title: "用户信息" }];
        plus.nativeUI.actionSheet({
            title: "搜索关键字类型",
            cancel: "取消",
            buttons: btnArray
        }, (e) => {
            var index = e.index;
            var type;
            switch (index) {
                case 1:
                    type = 'device';
                    this.getByAdress(key);
                    break;
                case 2:
                    type = 'user';
                    this.getByUser(key)
                    break;
            }
            this.setState({ loading: true, type });
        });
    }
    handleGetDeviceLocal(info: any) {
        return (ev: Event) => {
            ev.stopPropagation();
            ev.preventDefault();
            plus.nativeUI.confirm("确认定位到设备地址？", (e) => {
                if (e.index === 0) {
                    mui.fire(plus.webview.getLaunchWebview(), "getDeviceLocation", { point: info });
                    mui.back();
                }
            });
        }
    }
    handHistoriesClear() {
        plus.nativeUI.confirm("确认清除搜索记录列表？", (e) => {
            if (e.index === 0) {
                this.setState({ historiesList: [] });
                setSettings('searchHistories', []);
            }
        });
    }
    showUserInfo(userId: string) {
        return (ev: Event) => {
            ev.stopPropagation();
            ev.preventDefault();
            showPage("userInfo", { userId });
        }
    }    
    render(props: AppProps, state: AppState) {
        return (
            <section id="offLine">
                <header class="mui-bar">
                    <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
                    <h1 class="mui-title">离线设备</h1>
                </header>
                <section className="mui-content">
                    <div className="searchBar">
                        <input type="search" ref={el => this.searchInput = el} value={state.key} name="key" onKeyUp={this.handleKeyChange.bind(this)} placeholder="搜索姓名、身份证、地址" id="key" />
                        <div className="clear" {...{ onTap: this.clear.bind(this) }}></div>
                        <div className="search" {...{ onTap: this.handleSearch.bind(this) }}>搜索</div>
                    </div>
                    <div className={state.histories || state.type !== 'device' ? 'mui-hidden' : 'devicesList'}>
                        {state.devices.length && !state.loading ? state.devices.map((item: any) => (
                            <div className="item" {...{ onTap: this.showDeviceDetail(item.id) }}>
                                <div className="row">
                                    <div className="label">设备编号：</div>
                                    <div className="info">{item.deviceNumber}</div>
                                </div>
                                <div className="row">
                                    <div className="label">设备地址：</div>
                                    <div className="info">{item.address}</div>
                                </div>
                                <span className={!item.onlineState[0] ? 'status offline' : 'status'} {...{ onTap: this.handleGetDeviceLocal(item).bind(this) }}></span>
                            </div>
                        )) : state.loading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.loading && !state.devices.length ? <div className="noData">搜索内容为空</div> : ""}
                    </div>
                    <div className={state.histories || state.type !== 'user' ? 'mui-hidden' : 'devicesList'}>
                        {state.users.length && !state.loading ? state.users.map((item: any, key) => (
                            <div className="item" {...{ onTap: this.showUserInfo(item.id) }}>
                                <div className="row">
                                    <div className="label">姓名：</div>
                                    <div className="info">{item.name} <span className="userType">{item.userType}</span></div>
                                </div>
                                <div className="row">
                                    <div className="label">身份证：</div>
                                    <div className="info">{item.identityId}</div>
                                </div>
                            </div>
                        )) : state.loading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.loading && !state.users.length ? <div className="noData">搜索内容为空</div> : ""}
                    </div>
                    <div className={state.histories && state.historiesList.length ? 'searchHistories' : 'mui-hidden'}>
                        <h3>历史搜索</h3>
                        {state.historiesList.map((item: any) => (
                            <p className="key" {...{ onTap: this.handleHistory(item).bind(this) }}>{item}</p>
                        ))}
                        <div className="clear" {...{ onTap: this.handHistoriesClear.bind(this) }}>清空搜索历史</div>
                    </div>
                </section>
            </section>
        )
    }
}