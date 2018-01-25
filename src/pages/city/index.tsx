declare function require(moduleName: string): any;
declare const plus;

import "./index.scss";
import { h, Component } from "preact";
import { showPage, setImmersed, hideScroll, getSettings, setSettings, getCookie, setCookie } from "../../public/common/util";
import { REMOTE } from "../../public/config"

const mui = require("mui");
const city = require("city");
const provinces = {};

city.forEach((item: object | any) => {
    provinces[item.province] = provinces[item.province] || [];
    provinces[item.province].push(item);
});

export interface AppProps { }
interface AppState {
    provinces: object,
    cities: string;
    index: number
}

export class City extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.setState({
            provinces,
            cities: "上海",
            index: 0
        })
    }
    componentWillMount() {
        plus.navigator.setStatusBarStyle("light");
        hideScroll();
        mui.back = () => {
            plus.navigator.setStatusBarStyle("dark");
            plus.webview.currentWebview().close();
        }
    }
    componentDidMount() {
        setImmersed();
    }
    handleCities(item, index) {
        return () => {
            this.setState({
                index,
                cities: item
            })
        }
    }
    handleLocation({ longtitude, latitude, city }) {
        return () => {
            mui.fire(plus.webview.getLaunchWebview(), "selectLocation", { point: { longtitude, latitude } });
            mui.fire(plus.webview.getLaunchWebview(), "changeLocal", { city });
            mui.back();
        }
    }
    render(props: AppProps, state: AppState) {
        return (
            <section id="city">
                <header class="mui-bar">
                    <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
                    <h1 class="mui-title">城市选择</h1>
                    <button className="mui-btn mui-btn-blue mui-btn-link mui-pull-right mui-hidden">确认</button>
                </header>
                <section className="mui-content">
                    <div className="provinces">
                        <div className="cont">
                            <ul>
                                {Object.keys(state.provinces).map((item, index) => {
                                    return <li className={state.index === index ? 'active' : ''} {...{ onTap: this.handleCities(item, index).bind(this) }}>{item}</li>
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="cities">
                        <div className="cont">
                            <ul>
                                {state.provinces[state.cities].map((item, key) => {
                                    return <li className="" {...{ onTap: this.handleLocation(item) }}>{item.city}</li>
                                })}
                            </ul>
                        </div>
                    </div>
                </section>
            </section>
        );
    }
}
