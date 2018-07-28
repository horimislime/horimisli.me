---
layout: post
title: 仮想通貨のファンダメンタルズDashboardをプログラミングなしに作成する
date: 2018-7-29 12:00
categories: ["Mac", "投資", "Bitcoin"]
image: /images/macos-dashboard.png
---

各通貨ペアのチャートやテクニカル指標は [TradingView](https://tradingview.com/) が統合的な環境を提供してくれているが、ファンダメンタルズ指標はそう簡単にいかない。様々なサイトでデータが配信されているが、必要な情報を統合的に表示できるサービスは今のところなさそう。

自分は以下のサイトを見ていて、巡回が少し手間になっている。

- BTCの検索トレンド [bitcoin - 調べる - Google トレンド](https://trends.google.co.jp/trends/explore?q=bitcoin&geo=JP)
- BTCドミナンス [Global Charts | CoinMarketCap](https://coinmarketcap.com/charts/#dominance-percentage)
- BTC・BCHのハッシュレート [Bitcoin, Bitcoin Cash Hashrate chart](https://bitinfocharts.com/comparison/hashrate-btc-bch.html#1y)
- 日本・韓国・US・EUのBTC価格乖離 [国内ビットコイン市況 | Bitcoin日本語情報サイト](https://jpbitcoin.com/markets)
- PoloniexのLending手数料 [Poloniex Lending Rate History](http://www.polobot.net/ratehistory)

1ページで俯瞰的に見れた方が考察しやすいので自作するか・・・とも考えたけど、初期投資と運用コストは結構かかる。

どうしたものかと考えていたら、macOSの忘れ去られた機能「Dashboard」にWebクリップというものがあるのを思い出した。

[macOS Sierra: Web クリップウィジェットを作成する](https://support.apple.com/kb/PH25525?viewlocale=ja_JP&locale=ja_JP)

Safariでウェブサイトを開き、 `[ファイル] -> [Dashboardで開く…]` からページ上の領域を切り取ってDashboard上に表示することができる。以下のようなイメージ。

![Fundamentals Dashboard powered by macOS Dashboard](/images/macos-dashboard.png)

見た目はあまりカッコよくないんだけど、数分で構築できて十分な情報が見れるので悪くないと思う。流石にClipはインタラクティブじゃないので、チャートでマウスオーバーできないのは不便だけど仕方ない。

一つ問題は、どうもJSをゴリゴリ使っているサイトをClipしていると動作が不安定になる事。 [国内ビットコイン市況 | Bitcoin日本語情報サイト](https://jpbitcoin.com/markets)は挙動がおかしくてうまく使えなかった。あとたまにClipの大きさが変になったり、真っ白になったり、Dashboard自体がクラッシュしたりする。マイナー機能すぎてもう流石にメンテされてないのか…

なんか結局自前で構築する事になるかもしれないけど、Dashboard Widgetはこういう時に便利なのでもうちょっと続いて欲しいなという気持ち。
