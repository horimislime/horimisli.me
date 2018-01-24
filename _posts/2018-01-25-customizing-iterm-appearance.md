---
layout: post
title: iTerm2のウインドウをHyper風にカスタマイズする
date: 2018-01-25 11:00
categories: ["Development"]
---

![Customized iTerm title bar](/images/2018/cool-iterm-titlebar.png)

一時期 [zeit/hyper](https://github.com/zeit/hyper) を使っていたが、Emacsでyankしたら画面が固まったりと日常用途にはまだまだ厳しい部分がありiTermに戻ることにした。唯一名残惜しいのはタイトルバーとウインドウの境目がないかっこいいUIなんだけど、iTermでも似たようにカスタマイズできるらしい。

以下のサイトを参考にした。

- [Custom iTerm2 titlebar background colors – Code matters](https://codematters.blog/custom-iterm2-titlebar-background-colors-a088c6f2ec60)
- [Black titlebar (#4080) · Issues · George Nachman / iterm2 · GitLab](https://gitlab.com/gnachman/iterm2/issues/4080)

iTermをはじめとする端末エミュレータは、ANSI escape codeというのをechoで流すとタイトルバーやカーソルの見た目を操作できるらしい。iTermでどういったescape codeが使えるかは [Proprietary Escape Codes - Documentation - iTerm2 - Mac OS Terminal Replacement](https://www.iterm2.com/documentation/2.1/documentation-escape-codes.html) で確認できる。

早速上の記事を参考にタイトルバーを黒くしてHyperっぽい見た目にした。自分の環境はfishを使っているので以下の記述を `~/.config/fish/config.fish` に追加。

```
echo -e "\033]6;1;bg;red;brightness;40\a"
echo -e "\033]6;1;bg;green;brightness;44\a"
echo -e "\033]6;1;bg;blue;brightness;52\a"
```

このままだとタイトルバーの下に白いセパレータが残ってしまうので、iTermの [Preferences] → [Appearance] → [Show line under title bar when the tab bar is not visible] のチェックを解除。

左がiTermで右がHyper。ほとんど変わらないくらいカッコ良くなった。

![Customized iTerm and Hyper](/images/2018/iterm-hyper-comparison.png)

複数タブを開くと見た目が崩れたりするけど今の所とても満足。
