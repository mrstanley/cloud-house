# 云生有家APP

## 运行项目

  1.下载并安装依赖 npm install

  2.运行命令 npm test （开发环境）

  3.打包命令 npm start （生产环境）

  4.下载Dcloud开发工具 [Hbuider](http://www.dcloud.io/index.html)

  5.运行 Hbuider, 导入根目录build目录下 cloud-home-dev 或 cloud-home-prd项目

  6.右键项目目录转换成移动APP

  7.选中项目并运行。真机运行或参考Hbuider官方指南安装IOS或安卓模拟器。

## 项目目录说明

    build ------------------ 打包生成目标目录包含开发目录和生产目录
        cloud-home-dev ----- 开发环境项目目录
        cloud-home-prd ----- 生产环境项目目录
    src   ------------------ 项目源码
        pages -------------- APP具体页面目录
            app.tsx -------- APP首页入口文件
        public ------------- 公共资源目录存放第三方资源，公共模块、组件、函数、静态js、css等文件
    unpackage -------------- APP安装包，图标文件，启动图片等存放目录
    index.html ------------- 页面公共HTML模板文件所有APP页面的载体
    webpack.config.js ------ 项目打包配置文件具体配置参考webpack

## 使用框架说明

  项目使用 Typescript 编译ES6代码

  前端UI框架采用 [Preact](https://preactjs.com/)
  [mui](http://www.dcloud.io/mui.html)

  跨平台API参考 [H5+ runtime](http://www.dcloud.io/runtime.html), [5+ API](http://www.html5plus.org/doc/h5p.html)