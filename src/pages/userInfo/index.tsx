declare function require(moduleName: string): any;
declare const plus;

import "./index.scss";
import { h, Component } from "preact";
import { showPage, setImmersed, hideScroll, getSettings, setSettings, getCookie, setCookie } from "../../public/common/util";
import { REMOTE } from "../../public/config"

const mui = require("mui");
const layer = require("layer");
import "pullToRefresh";

let token, infoLayer;
const reviewState = ['待审核', '审核通过', '审核未通过'];
const imgUrl = REMOTE + "file/"

export interface AppProps { }
interface AppState {
    userInfo: object | any;
    authInfoList: object[];
    authLoading: boolean;
    authPageNo: number;
    loading: boolean;
}

export class UserInfo extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.setState({ authInfoList: [], authLoading: true })
    }
    componentWillMount() {
        hideScroll();
        token = getCookie("access_token");
        let userId = plus.webview.currentWebview().userId;
        mui.back = () => {
            typeof infoLayer !== "undefined" ? (layer.closeAll(), infoLayer = undefined) : plus.webview.currentWebview().close();
        }
        mui.ajax(REMOTE + "user/selectById/" + userId, {
            type: 'get',
            headers: { 'Content-Type': 'application/json', 'access_token': token },
            success: (res) => {
                if (res.success && res.data) {
                    this.setState({ userInfo: res.data, loading: false });
                } else {
                    mui.toast("获取用户信息失败，请重试");
                }
            },
            error(xhr, type, errorThrown) {
                mui.toast("获取用户信息出错，请重试");
            }
        });
        this.getAuthInfo({
            pageNo: 0,
            data: { authUserId: userId },
            success: (content) => {
                this.setState({ authInfoList: content, authLoading: false, authPageNo: 0 });
                const that = this;
                mui(window["authInfoList"]).pullToRefresh({
                    up: {
                        contentinit: "正在加载中...",
                        contentnomore: "",
                        callback() {
                            const self = (this as any);
                            that.getAuthInfo({
                                pageNo: that.state.authPageNo + 1,
                                data: { authUserId: userId },
                                success: (list) => {
                                    that.setState({ authInfoList: that.state.authInfoList.concat(list), authPageNo: that.state.authPageNo + 1 });
                                    self.endPullUpToRefresh(!list.length || list.length < 10);
                                }
                            });
                        }
                    }
                }).endPullUpToRefresh(!content.length || content.length < 10);
            }
        });
    }
    getAuthInfo(params) {
        mui.ajax(REMOTE + "auth/history/" + params.pageNo + "/10", {
            data: params.data, type: "post",
            headers: { 'Content-Type': 'application/json', 'access_token': token },
            success: (res) => {
                if (res.success && res.data.content) {
                    params.success(res.data.content);
                } else {
                    mui.toast("获取用户信息失败，请重试");
                    params.error();
                }
            }
        })
    }
    componentDidMount() {
        setImmersed();
        mui(window['scroll1']).scroll({
            indicators: true // 是否显示滚动条
        });
    }
    showDeviceDetail(deviceId) {
        return function () {
            const opener = plus.webview.currentWebview().opener();
            opener && opener.close("none");
            mui.later(() => {
                showPage("deviceDetail", { deviceId });
            }, 100);
        }
    }
    handlePickUpInfo() {
        infoLayer = layer.open({
            type: 1,
            content: (
                `<div class="userInfo">        
                    <div class="authContainer">
                        <div class="item">
                            <div class="row">
                                <div class="label">姓名：</div>
                                <div class="info">${this.state.userInfo.userName}</div>
                            </div>
                            <div class="row">
                                <div class="label">身份证：</div>
                                <div class="info">${this.state.userInfo.identityId}</div>
                            </div>
                            <div class="row">
                                <div class="label">审核状态：</div>
                                <div class="info">${reviewState[this.state.userInfo.reviewState] || ""}</div>
                            </div>
                            <div class="row">
                                <div class="label">审核人：</div>
                                <div class="info">${this.state.userInfo.reviewer || ""}</div>
                            </div>
                            <div class="row">
                                <div class="label">创建时间：</div>
                                <div class="info">${this.state.userInfo.createTime}</div>
                            </div>
                            <div class="row">
                                <div class="label">审核时间：</div>
                                <div class="info">${this.state.userInfo.reviewTime}</div>
                            </div>
                            <div class="row">
                                <div class="label">更新时间：</div>
                                <div class="info">${this.state.userInfo.updateTime}</div>
                            </div>
                            <div class="row">
                                <div class="label">采集终端：</div>
                                <div class="info">${this.state.userInfo.terminalId}</div>
                            </div>
                        </div>
                    </div>
                </div>`
            ),
            style: 'position:fixed; bottom:50%; left:50%; width: 6rem; height: 4.96rem; padding:10px 0; border:none; margin-left:-3rem; margin-bottom:-2.48rem; border-radius: .08rem;'
        });
    }
    render(props: AppProps, state: AppState) {
        return (
            <section id="userInfo">
                <header class="mui-bar">
                    <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
                    <h1 class="mui-title">人员信息</h1>
                </header>
                <section className="mui-content">
                    <div className="userInfo">
                        {state.userInfo && !state.loading ? (
                            <div>
                                <div className="picList">
                                    <div className="pic">
                                        <div className="img">
                                            <img src={imgUrl + state.userInfo.identityPhoto} alt="身份证照片" />
                                        </div>
                                        <div className="desc">身份证照片</div>
                                    </div>
                                    <div className="pic">
                                        <div className="img">
                                            <img src={imgUrl + state.userInfo.userPhoto} alt="采集照片" />
                                        </div>
                                        <div className="desc">采集照片</div>
                                    </div>
                                </div>
                                <div className="authContainer">
                                    <div className="item">
                                        <div className="row">
                                            <div className="label">姓名：</div>
                                            <div className="info">{state.userInfo.userName}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">身份证：</div>
                                            <div className="info">{state.userInfo.identityId}</div>
                                        </div>
                                        <div className="showUser" {...{ onTap: this.handlePickUpInfo.bind(this) }}>查看采集信息</div>
                                    </div>
                                </div>
                            </div>
                        ) : state.loading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.loading && !state.userInfo ? <div className="noData">未获取到用户信息</div> : ''}
                    </div>
                    <h3 className="recordsTitle">授权设备记录</h3>
                    <div className="records">
                        <div id="scroll1" className="mui-scroll-wrapper">
                            <div className="mui-scroll" id="authInfoList">
                                <div className="authContainer">
                                    {state.authInfoList.length && !state.authLoading ? state.authInfoList.map(((item: any, index) => (
                                        <div className="item" {...{ onTap: this.showDeviceDetail(item.deviceId) }}>
                                            <div className="row">
                                                <div className="label">设备编号：</div>
                                                <div className="info">{item.deviceNo}</div>
                                            </div>
                                            <div className="row">
                                                <div className="label">设备地址：</div>
                                                <div className="info">{item.deviceAddress}</div>
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
                                        </div>
                                    ))) : state.authLoading ? <div className="loading"><span class="mui-spinner"></span><br />加载中...</div> : !state.authLoading && !state.authInfoList.length ? <div className="noData">暂无授权信息</div> : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        );
    }
}
