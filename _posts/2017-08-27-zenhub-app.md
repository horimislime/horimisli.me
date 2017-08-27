---
layout: post
title: ZenHubのデスクトップアプリをElectronで実装した
date: 2017-08-27 10:00
categories: ["Development", "JavaScript"]
---


これまでブラウザExtension必須だったZenHubの[ウェブアプリ版](https://www.zenhub.com/blog/zenhub-now-available-for-web-and-mobile-devices/)が先日リリースされたので、デスクトップアプリにラップして使えるようにしてみた。[nativefier](https://github.com/jiahaog/nativefier)で手軽にやっても良かったんだけど、せっかくなのでElectronの練習がてらちょっとウインドウの見た目をいじっていい感じにしたりした。

![screenshot](/images/2017/zenhub-screenshot.png)

ダウンロードは [horimislime/Zeta: Unofficial ZenHub app built with Electron](https://github.com/horimislime/Zeta) から。ブラウザと独立して開いておけるようになって便利。
