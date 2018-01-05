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

import "pullToRefresh";


let token, pullList;
let deviceId, deviceNumber;


export interface AppProps {

}
interface AppState {
    key: string;
    optType: number;
    deviceDetail: object | any;
    deviceLoading: boolean;
    currentAuth: object[] | any;
    authPageNo: number;
    authLoading: boolean;
    recordsList: object[];
    recordsLoading: boolean;
    recordsPageNo: number;
    historiesList: object[] | any;
    historiesLoading: boolean;
    historiesPageNo: number;
}

export class DeviceDetail extends Component<AppProps, AppState> {
    public searchInput: HTMLInputElement | any;
    constructor(props: AppProps) {
        super(props);
        this.setState({ deviceLoading: true, authLoading: true, currentAuth: [], recordsList: [], historiesList: [], optType: 0, key: '' });
    }
    componentWillMount() {
        token = getCookie("access_token");
        deviceId = plus.webview.currentWebview().deviceId
        hideScroll();
        plus.navigator.setStatusBarStyle("light");
        mui.back = () => {
            const opener = plus.webview.currentWebview().opener();
            if (opener && opener.id !== "nearby") {
                plus.navigator.setStatusBarStyle("dark");
            }
            plus.webview.currentWebview().close();
        }
        mui.ajax(REMOTE + "device/selectById/" + deviceId, {
            type: 'get',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token
            },
            success: (res) => {
                if (res.success && res.data) {
                    this.setState({ deviceDetail: res.data, deviceLoading: false });
                    // 获取当前设备授权信息
                    this.getCurrentAuth({
                        pageNo: 0,
                        success: (content) => {
                            this.setState({ currentAuth: content, authLoading: false, authPageNo: 0 });
                            const that = this;
                            mui(window["currentAuth"]).pullToRefresh({
                                up: {
                                    contentinit: "正在加载中...",
                                    contentnomore: "",
                                    callback() {
                                        const self = (this as any);
                                        that.getCurrentAuth({
                                            pageNo: that.state.authPageNo + 1,
                                            success: (list) => {
                                                that.setState({ currentAuth: that.state.currentAuth.concat(list), authPageNo: that.state.authPageNo + 1 });
                                                self.endPullUpToRefresh(!list.length || list.length < 10);
                                            }
                                        });
                                    }
                                }
                            }).endPullUpToRefresh(!content.length || content.length < 10);
                        }
                    });
                    deviceNumber = res.data.deviceNumber;
                } else {
                    mui.toast("获取设备信息失败，请重试");
                }
            },
            error(xhr, type, errorThrown) {
                mui.toast("获取设备信息出错，请重试");
            }
        });
    }
    getCurrentAuth(params) {
        mui.ajax(REMOTE + "auth/page/" + params.pageNo + "/10", {
            data: params.data || { deviceId }, type: 'post',
            headers: { 'Content-Type': 'application/json', 'access_token': token },
            success: (res) => {
                if (res.success && res.data.content) {
                    params.success(res.data.content);
                } else {
                    mui.toast("获取设备授权信息失败，请重试");
                    this.setState({ authLoading: false });
                    params.error();
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("获取设备授权信息出错，请重试");
                this.setState({ authLoading: false });
                params.error();
            }
        });
    }
    componentDidMount() {
        setImmersed();
        [].forEach.call(document.querySelectorAll(".mui-scroll-wrapper"), (item) => {
            mui(item).scroll({
                indicators: true // 是否显示滚动条
            });
        });
    }
    getRecords(params) {
        mui.ajax(REMOTE + "device/listOpr/" + params.pageNo + "/10", {
            data: params.data || { deviceId, userName: this.state.key, operateType: this.state.optType }, type: 'post',
            headers: { 'Content-Type': 'application/json', 'access_token': token },
            success: (res) => {
                if (res.success && res.data.content) {
                    params.success(res.data.content);
                } else {
                    mui.toast("获取设备使用信息失败，请重试");
                    this.setState({ recordsLoading: false });
                    params.error();
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("获取设备使用信息出错，请重试");
                this.setState({ recordsLoading: false });
                params.error();
            }
        });
    }
    getHistories(params) {
        mui.ajax(REMOTE + "auth/history/" + params.pageNo + "/10", {
            data: params.data || { deviceId }, type: 'post',
            headers: { 'Content-Type': 'application/json', 'access_token': token },
            success: (res) => {
                if (res.success && res.data.content) {
                    params.success(res.data.content);
                } else {
                    mui.toast("获取设备授权信息失败，请重试");
                    this.setState({ historiesLoading: false });
                    params.error();
                }
            },
            error: (xhr, type, errorThrown) => {
                mui.toast("获取设备授权信息出错，请重试");
                this.setState({ historiesLoading: false });
                params.error();
            }
        });
    }
    handleShowRecords() {
        if (!this.state.recordsLoading && !this.state.recordsList.length) {
            this.setState({ recordsLoading: true });
            this.getRecords({
                pageNo: 0,
                success: (content) => {
                    this.setState({ recordsList: content, recordsLoading: false, recordsPageNo: 0 });
                    const that = this;
                    pullList = null;
                    pullList = mui(window["recordsList"]).pullToRefresh({
                        up: {
                            contentinit: "正在加载中...",
                            contentnomore: "",
                            callback() {
                                const self = (this as any);
                                that.getRecords({
                                    pageNo: that.state.recordsPageNo + 1,
                                    success: (list) => {
                                        that.setState({ recordsList: that.state.recordsList.concat(list), recordsPageNo: that.state.recordsPageNo + 1 });
                                        self.endPullUpToRefresh(!list.length || list.length < 10);
                                    }
                                });
                            }
                        }
                    }).endPullUpToRefresh(!content.length || content.length < 10);
                }
            });
        }
    }
    handleShowHistories() {
        if (!this.state.historiesLoading && !this.state.historiesList.length) {
            this.setState({ historiesLoading: true });
            this.getHistories({
                pageNo: 0,
                success: (content) => {
                    this.setState({ historiesList: content, historiesLoading: false, historiesPageNo: 0 });
                    const that = this;
                    mui(window["historiesList"]).pullToRefresh({
                        up: {
                            contentinit: "正在加载中...",
                            contentnomore: "",
                            callback() {
                                const self = (this as any);
                                that.getHistories({
                                    pageNo: that.state.historiesPageNo + 1,
                                    success: (list) => {
                                        that.setState({ historiesList: that.state.historiesList.concat(list), historiesPageNo: that.state.historiesPageNo + 1 });
                                        self.endPullUpToRefresh(!list.length || list.length < 10);
                                    }
                                });
                            }
                        }
                    }).endPullUpToRefresh(!content.length || content.length < 10);
                }
            });
        }
    }
    handleKeyChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }
    clear(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.state.key) {
            this.setState({ key: "" });
        }
    }
    showInfo(item, index, type) {
        return () => {
            this.state[type].splice(index, 1, { ...this.state[type][index], show: !this.state[type][index].show });
            this.setState({ [type]: this.state[type] });
        }
    }
    showUserInfo(userId: string) {
        return (ev: Event) => {
            ev.stopPropagation();
            ev.preventDefault();
            const userInfo = plus.webview.getWebviewById("userInfo");
            userInfo && userInfo.close("none");
            mui.later(() => {
                showPage("userInfo", { userId });
            }, 100);
        }
    }
    handleOptType(type) {
        return () => {
            this.setState({ optType: type });
            this.handleSearch();
        }
    }
    handleSearch() {
        this.setState({ recordsList: [], recordsLoading: false });
        this.handleShowRecords();
    }
    render(props: AppProps, state: AppState) {
        return (
            <section id="deviceDetail">
                <header class="mui-bar">
                    <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
                    <h1 class="mui-title">设备详情</h1>
                </header>
                <section className="deviceContainer">
                    <section className="deviceInfo app-content">
                        {!state.deviceLoading && state.deviceDetail ? (
                            <div className="summary">
                                <div className="row">
                                    <div className="label">设备编号：</div>
                                    <div className="info">{state.deviceDetail.deviceNumber}</div>
                                </div>
                                <div className="row">
                                    <div className="label">设备地址：</div>
                                    <div className="info">{state.deviceDetail.address}</div>
                                </div>
                                <div className="row">
                                    <div className="label">设备 ID：</div>
                                    <div className="info">{state.deviceDetail.id}</div>
                                </div>
                                <div className="row">
                                    <div className="label">所有者ID：</div>
                                    <div className="info">{state.deviceDetail.ownerId}</div>
                                </div>
                                <div className="row">
                                    <div className="label">录入时间：</div>
                                    <div className="info">{state.deviceDetail.inputTime}</div>
                                </div>
                                <div className="row">
                                    <div className="label">经度：</div>
                                    <div className="info">{state.deviceDetail.longitude}</div>
                                    <div className="label">纬度：</div>
                                    <div className="info">{state.deviceDetail.latitude}</div>
                                </div>
                                <div className="row">
                                    <div className="label">是否启用：</div>
                                    <div className="info">{state.deviceDetail.deviceState ? '是' : '否'}</div>
                                    <div className="label">在线状态：</div>
                                    <div className="info">{state.deviceDetail.onlineState[0] ? '在线' : '离线'}</div>
                                </div>
                            </div>
                        ) : state.deviceLoading ? <div className="loading"><span class="mui-spinner mui-spinner-white"></span><br />加载中...</div> : !state.deviceLoading && !state.deviceDetail ? <div className="noData">暂无设备信息</div> : ''}
                    </section>
                    <section className="deviceUseInfo">
                        <div className="mui-segmented-control mui-segmented-control-inverted">
                            <a className="mui-control-item mui-active" href="#item1">当前授权</a>
                            <a className="mui-control-item" href="#item2" {...{ onTap: this.handleShowRecords.bind(this) }}>使用记录</a>
                            <a className="mui-control-item" href="#item3" {...{ onTap: this.handleShowHistories.bind(this) }}>历史授权</a>
                        </div>
                        <div className="itemContainer">
                            <div id="item1" className="mui-control-content mui-active">
                                <div id="scroll1" className="mui-scroll-wrapper">
                                    <div className="mui-scroll" id="currentAuth">
                                        {state.currentAuth.length && !state.authLoading ? <div className="authContainer">{state.currentAuth.map(((item: any, index) => (
                                            <div className={item.show ? "item show" : "item"} {...{ onTap: this.showInfo(item, index, "currentAuth").bind(this) }}>
                                                <div className="row">
                                                    <div className="label">姓名：</div>
                                                    <div className="info">{item.userName}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="label">身份证：</div>
                                                    <div className="info">{item.userIdentityId}</div>
                                                </div>
                                                <div className={item.show ? "" : "mui-hidden"}>
                                                    <div className="row">
                                                        <div className="label">用户ID</div>
                                                        <div className="info">{item.userId}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">开始时间：</div>
                                                        <div className="info">{item.startTime}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">结束时间：</div>
                                                        <div className="info">{item.endTime}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">是否成功下发：</div>
                                                        <div className="info">{item.success ? '是' : '否'}</div>
                                                        <div className="label">下发次数：</div>
                                                        <div className="info">{item.pushTimes}次</div>
                                                    </div>
                                                    <div className="showUser" {...{ onTap: this.showUserInfo(item.userId).bind(this) }}>查看租客信息</div>
                                                </div>
                                            </div>
                                        )))}</div> : state.authLoading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.authLoading && !state.currentAuth.length ? <div className="noData">暂无授权信息</div> : ''}
                                    </div>
                                </div>
                            </div>
                            <div id="item2" className="mui-control-content">
                                <div className="recordsContainer">
                                    <div className="searchBar">
                                        <input type="search" ref={el => this.searchInput = el} value={state.key} name="key" onKeyUp={this.handleKeyChange.bind(this)} placeholder="搜索姓名、身份证、地址" id="key" />
                                        <div className="clear" {...{ onTap: this.clear.bind(this) }}></div>
                                        <div className="search" {...{ onTap: this.handleSearch.bind(this) }}>搜索</div>
                                    </div>
                                    <div className="operatorType" {...{ onTap: this.handleOptType.bind(this) }}>
                                        <div className={state.optType === 0 ? 'opt mui-active' : 'opt'} {...{ onTap: this.handleOptType(0).bind(this) }}>全部操作类型</div>
                                        <div className={state.optType === 1 ? 'opt mui-active' : 'opt'} {...{ onTap: this.handleOptType(1).bind(this) }}>开门</div>
                                        <div className={state.optType === 2 ? 'opt mui-active' : 'opt'} {...{ onTap: this.handleOptType(2).bind(this) }}>关门</div>
                                    </div>
                                    <div className="recordsTitle">
                                        <div className="user">使用人员</div>
                                        <div className="optType">操作类型</div>
                                        <div className="optTime">操作时间</div>
                                    </div>
                                    <div className="recordsList">
                                        <div id="scroll2" className="mui-scroll-wrapper">
                                            <div className="mui-scroll" id="recordsList">
                                                {state.recordsList.length && !state.recordsLoading ? state.recordsList.map((item: any) => {
                                                    return (
                                                        <div className="item">
                                                            <div className="user">{item.userName}<br />{item.identityId}</div>
                                                            <div className="optType">{item.operateType ? '开门' : '关门'}</div>
                                                            <div className="optTime">{item.operateTime}</div>
                                                        </div>
                                                    )
                                                }) : state.recordsLoading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.recordsLoading && !state.recordsList.length ? <div className="noData">暂无使用记录</div> : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="item3" className="mui-control-content">
                                <div id="scroll3" className="mui-scroll-wrapper">
                                    <div className="mui-scroll" id="historiesList">
                                        {state.historiesList.length && !state.historiesLoading ? <div className="authContainer">{state.historiesList.map(((item: any, index) => (
                                            <div className={item.show ? "item show" : "item"} {...{ onTap: this.showInfo(item, index, "historiesList").bind(this) }}>
                                                <div className="row">
                                                    <div className="label">姓名：</div>
                                                    <div className="info">{item.userName}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="label">身份证：</div>
                                                    <div className="info">{item.userIdentityId}</div>
                                                </div>
                                                <div className={item.show ? "" : "mui-hidden"}>
                                                    <div className="row">
                                                        <div className="label">用户ID</div>
                                                        <div className="info">{item.userId}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">开始时间：</div>
                                                        <div className="info">{item.startTime}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">结束时间：</div>
                                                        <div className="info">{item.endTime}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="label">是否成功下发：</div>
                                                        <div className="info">{item.success ? '是' : '否'}</div>
                                                        <div className="label">下发次数：</div>
                                                        <div className="info">{item.pushTimes}次</div>
                                                    </div>
                                                    <div className="showUser" {...{ onTap: this.showUserInfo(item.userId).bind(this) }}>查看租客信息</div>
                                                </div>
                                            </div>

                                        )))}</div> : state.historiesLoading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.historiesLoading && !state.historiesList.length ? <div className="noData">暂无授权信息</div> : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
            </section>
        )
    }
}