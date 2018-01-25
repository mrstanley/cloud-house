declare function require(moduleName: string): any;
declare const plus;
declare global {
    interface Window {
        mui: any;
    }
}

import "./index.scss";
import { h, Component } from "preact";
import { MAP_URL, REMOTE } from "../../public/config";
import { getCookie, DrawBabbleImg, setSettings, showPage, getSettings } from "../../public/common/util";

const mui = require("mui");
window.mui = mui;

let babbleImg;

export interface AppProps {
    name: string;
}
interface AppState {
    name: string;
}

let map: any = null;
export class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
    }
    componentWillMount() {
        babbleImg = new DrawBabbleImg();
    }
    getUserLocation() {
        map.getUserLocation((state, point) => {
            if (0 == state) {
                var newPoint = new plus.maps.Point(point.longitude, point.latitude);
                this.getCityInfo(point);
            } else {
                mui.toast("获取用户位置失败");
            }
        });
    }
    setCityArea(location) {
        var currentPosition = new plus.maps.Point(location.lng, location.lat);
        map.setCenter(currentPosition);
        map.centerAndZoom(currentPosition, 12);
        mui.later(() => {
            const boundsPoint = map.getBounds();
            this.getDevicesList(boundsPoint);
        }, 1000);
    }
    getDevicesList(point) {
        const that = this;
        setSettings("currentBounds", point);
        const data = {
            // ownerId: "1",
            nearBy: [
                { y: point.northease.longitude, x: point.northease.latitude },
                { y: point.southwest.longitude, x: point.southwest.latitude }
            ]
        };
        const token = getCookie("access_token");
        if (token) {
            mui.ajax(REMOTE + "device/page/0/10000", {
                data,
                type: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': token
                },
                success(res) {
                    if (res.success && res.data) {
                        that.showDevices(res.data.content);
                    } else {
                        mui.toast("获取设备列表失败，请重试");
                    }
                },
                error(xhr, type, errorThrown) {
                    mui.toast("获取设备列表出错，请重试");
                }
            });
        } else {
            mui.toast("请登录获取设备");
        }
    }
    showDevices(list: object[]) {
        console.log(JSON.stringify(list));
        var current = getSettings("currentDevice");
        map.clearOverlays();
        list.forEach((item: object | any) => {
            var marker = new plus.maps.Marker(new plus.maps.Point(item.longitude, item.latitude));
            if (item.onlineState[0]) {
                marker.setIcon(require("../../public/images/icon_loca_normal@3x.png"));
            } else {
                marker.setIcon(require("../../public/images/icon_loca_abnormal@3x.png"));
            }
            var bubble = new plus.maps.Bubble("设备编号：" + item.deviceNumber + "\n设备地址：" + item.address);
            bubble.onclick = () => {
                showPage("deviceDetail", { deviceId: item.id });
            };
            if (current && current.id === item.id) {
                if (item.onlineState[0]) {
                    marker.setIcon(require("../../public/images/icon_loca_normal_sel@3x.png"));
                } else {
                    marker.setIcon(require("../../public/images/icon_loca_abnormal_sel@3x.png"));
                }
                marker.bringToTop();
            }
            marker.setBubble(bubble);
            bubble.loadImageDataURL(babbleImg[plus.os.name === 'iOS' ? 'iosDraw' : 'draw'](item.deviceNumber, item.address));
            map.addOverlay(marker);
        });
    }
    getCityInfo(point) {
        mui.getJSON(MAP_URL + "location=" + point.latitude + "," + point.longitude + "&output=json&pois=0", {}, (data) => {
            if (data.status === 0 && data.result.addressComponent && data.result.addressComponent.city) {
                mui.fire(plus.webview.currentWebview(), "changeLocal", { city: data.result.addressComponent.city });
                setSettings("changeLocal", data.result.addressComponent.city);
                mui.getJSON(MAP_URL + "address=" + data.result.addressComponent.city + "&output=json", {}, (res) => {
                    if (res.status === 0 && res.result.location) {
                        this.setCityArea(res.result.location);
                    } else {
                        mui.toast("解析用户所在城市错误");
                    }
                });
            } else {
                mui.toast("未获取到用户所在城市");
            }
        });
    }
    componentDidMount() {
        map = new plus.maps.Map("map", { position: 'absolute' });
        this.getUserLocation();
        map.showUserLocation(true);
        map.onstatuschanged = (event) => {
            const boundsPoint = map.getBounds();
            this.getDevicesList(boundsPoint);
        }
        setSettings("currentDevice", "");
        window.addEventListener("getUserDevices", () => {
            this.getUserLocation();
        });
        window.addEventListener("getDeviceLocation", (ev: any) => {
            const { point } = ev.detail;
            setSettings("currentDevice", point);
            var newPoint = new plus.maps.Point(point.longitude, point.latitude);
            map.setZoom(16);
            map.setCenter(newPoint);
            // map.centerAndZoom(newPoint, 16);
            mui.later(() => {
                const boundsPoint = map.getBounds();
                this.getDevicesList(boundsPoint);
            }, 1000);
            mui.toast("正在定位设备...", {
                duration: 3000
            })
        });
        window.addEventListener("getUserLocation", () => {
            map.getUserLocation((state, point) => {
                if (0 == state) {
                    var newPoint = new plus.maps.Point(point.longitude, point.latitude);
                    map.centerAndZoom(newPoint, 16);
                    mui.later(() => {
                        const boundsPoint = map.getBounds();
                        this.getDevicesList(boundsPoint);
                    }, 1000);
                } else {
                    mui.toast("获取用户位置失败");
                }
            });
        });
        window.addEventListener("selectLocation", (ev: any) => {
            var newPoint = new plus.maps.Point(ev.detail.point.longtitude, ev.detail.point.latitude);
            map.centerAndZoom(newPoint, 12);            
            map.setCenter(newPoint);
            mui.later(() => {
                const boundsPoint = map.getBounds();
                this.getDevicesList(boundsPoint);
            }, 1000);
        })
    }
    render(props: AppProps, state: AppState) {
        return (
            <div id="map">
                地图载入中...
            </div>
        );
    }
}
