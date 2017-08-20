---
layout: post
title: Electronの各Platform向けアプリアイコンを作成する
date: 2017-08-20 10:00
categories: ["Development"]
---

Electronでアプリケーションを書く際、macOS・Linux・Windowsの各プラットフォーム向けにアイコンデータを作成する手順がややこしかったので整理した。

# macOS向け

icnsファイルが必要になる。icns形式の作成方法はネットに色々書かれているが、現時点では

- Xcodeに付属ツールIcon ComposerはmacOS Sierra以降非対応で使えない
- macOS標準の`iconutil`を使った方がいい

というのが結論。

作成手順としては、以下の画像のセットを入れた`hoge.iconset`ディレクトリを用意し、`iconutil -c icns hoge.iconset`を叩く。

- icon_512x512@2x.png (1024px)
- icon_512x512.png
- icon_256x256@2x.png
- icon_256x256.png
- icon_128x128@2x.png
- icon_128x128.png
- icon_32x32@2x.png
- icon_32x32.png
- icon_16x16@2x.png
- icon_16x16.png

※この時ファイル名が `icon_...` でないとコマンドエラーになってしまうので注意

かなり数が多いが、Sketchで以下のように指定して一気に画像を書き出した。元のアイコン素材のサイズは512x512で、それより小さいサイズをか書き出すときは`256w`みたく書き出すサイズを指定すれば簡単にいけた。

![Sketch export](/images/2017/sketch-electron-icon-export.png)

# Linux向け
こちらは普通にpngファイルを用意すればいいので簡単。[electron-builder](https://github.com/electron-userland/electron-builder)を使うとmacOS向けのicnsファイルから必要な画像を抽出してくれて便利だった。

[https://github.com/electron-userland/electron-builder/wiki/Options](https://github.com/electron-userland/electron-builder/wiki/Options)

> icon String - The path to icon set directory, relative to the the build resources or to the project directory. The icon filename must contain the size (e.g. 32x32.png) of the icon. By default will be generated automatically based on the macOS icns file.

# Windows向け
.icoファイルが必要。これは[Convert PNG to ICO and ICNS icons online - iConvert Icons](https://iconverticons.com/online/)を使うと楽だった。

# まとめ
- macOS: `iconutil`を使って生成する
- Linux: png一枚あればOK、electron-builderを使えばicnsファイルから生成可能
- Windows: [iConvert Icons](https://iconverticons.com/online/)等のウェブサービスを利用するのが一番楽
