---
title: "Herokuでnginx+Jekyllな構成を作った"
date: 2015-02-24 02:28:28 +0900
comments: true
layout: post
---

![](/images/2014/02/jekyll-sticker.jpg)

Jekyllが許されるのは小学生までとの話もありますが、好きですJekyll！✌('ω')✌

これまで何度かJekyllやOctopressでブログを公開したものの、カスタマイズに時間をかけ過ぎて消耗し、はてなブログに戻るというのを繰り返していた。
しかし去年末からやっぱり自前でブログホストしたいなーという気持ちが高まり、改めてJekyllでブログ環境を構築してみた。

これはその時の作業ログ的なもの。

# Why Jekyll?
デザイン等のサンプル豊富で楽。これに尽きる。Hugoはビルドが爆速らしいしMiddlemanとかも気になるんだけど、Jekyllに比べるとけっこう自分で頑張らないといけない。

今回はあくまで **構築で消耗しない** 事を目標に。

# ブログの下地を準備する
まずはJekyllブログの雛形になるリポジトリをforkしてくる。[Jekyll Themes](http://jekyllthemes.org/)に行けばデザインイメージとセットでサンプルが
沢山公開されている。
自分は[m3xm/hikari-for-Jekyll](https://github.com/m3xm/hikari-for-Jekyll)が見た目的に気に入ったのでこれを使う事にした。

[barryclark/jekyll-now](https://github.com/barryclark/jekyll-now)ではforkからGithub Pages上でのブログ公開までを数分で行えるようフローがまとめられているので、
手っ取り早く試したいならこれもアリかも。

自分のリポジトリが出来上がったら、`bundle install`からの`jekyll serve`して動作確認。

# Herokuへのデプロイ
ホスティング先も手間のかからないものを選ぶ。AWSやDigitalOceanあたりだと自由すぎて爆死しそうなので今回は自重。

手っ取り早さなら確実にGithub Pagesになるんだけど、今回は諸事情で前段にnginxを挟みたいのでHerokuを使うことにした。

toolbeltを使って普通にセットアップしていく。

```
$ heroku apps:create horimislime-blog
```

config varsはこんな感じ。buildpackには[ddollar/heroku-buildpack-multi](https://github.com/ddollar/heroku-buildpack-multi)を利用。
これを使ってリポジトリ下の.buildpacksに記述したRubyとnginxのbuildpackを読み込むようにする。

```
$ heroku config
=== horimislime-blog Config Vars
BUILDPACK_URL: https://github.com/ddollar/heroku-buildpack-multi.git
LANG:          ja_JP.UTF-8
PORT:          80
```

.buildpacksはこんな感じ。

```
https://github.com/ryandotsmith/nginx-buildpack.git
https://codon-buildpacks.s3.amazonaws.com/buildpacks/heroku/ruby.tgz
```

## nginxの設定
nginx-buildpackで読み込む設定を`config/nginx.conf.erb`に記述する。
[nginx-buildpack/nginx.conf.erb](https://github.com/ryandotsmith/nginx-buildpack/blob/master/config/nginx.conf.erb)を
そのまま持ってきて、自分好みのconfに改造すればいい。

続いてJekyll+nginx構成を動かすためのProcfile、config.ruとunicorn.rbを書く。


```
# Procfile
web: bin/start-nginx bundle exec unicorn -c ./unicorn.rb
```

```ruby
# config.ru
require "bundler/setup"
Bundler.require(:default)

run Rack::Jekyll.new(:destination => '_site')
```

```ruby
# unicorn.rb
require 'fileutils'
worker_processes 1
timeout 30
preload_app true
listen '/tmp/nginx.socket'

before_fork do |server,worker|
  FileUtils.touch('/tmp/app-initialized')
end
```

ここまで終われば`git push heroku master`でブログが公開されるはず。


## DNSの設定
blog.horimisli.meで運用したいんだけど、Herokuは通常の方法だとapexドメインが設定できない。

そこでプロバイダ側の設定をちょっと変えてやる必要がある。以下の記事を参考にすれば完結する。  
[お名前.comを使ってHerokuのルートドメインを設定する - Qiita](http://qiita.com/numa08/items/d4ad9454f0baefc8c784)

# その他
これで最低限ブログを書き始める準備はできた。ここからは追加でやった設定とかちょっとした編集環境の整備まわり。

## Github Flavored Markdown対応
コードブロックをLiquidタグで書くのが面倒なのでfenced code blockに対応させる。

さいきんのJekyll2.x系だと_config.ymlで `markdown: redcarpet` にするだけでOKだった。

## Plugin導入
インラインblockでハイライトするために[bdesham/inline_highlight](https://github.com/bdesham/inline_highlight)を入れた。できれば
\`\`\`foo\`\`\`みたいにfenced blockでハイライトしたいんだけど、方法あるんだろうか。

写真の貼り付けには[robwierzbowski/jekyll-picture-tag](https://github.com/robwierzbowski/jekyll-picture-tag)を利用。これで
リサイズ処理もよしなにやってくれる。

## 執筆環境
Jekyllは新規エントリのMarkdownを生成するコマンドは用意されていない。毎回YAML Front Matterを手書きするのはツラいので、エディタ環境を整備する。

自分はAtomで記事を書いているので[jekyll-atom](https://atom.io/packages/jekyll)を導入した。これを使えば新規エントリを作成したりAtom上から
サーバを起動してのプレビューも行える。あと[markdown-writer](https://atom.io/packages/markdown-writer)も入れておけば簡単にMarkdown形式の
リンクURLを挿入できて便利。

# まとめ
Jekyllの導入から公開までに自分がやった事をまとめた。ほぼインターネット上のリソースを参考にカスタマイズは最小限にしたので、構築で体力が無くなる事もなく
公開にこぎつけた。

ビルド時間の問題でJekyllからHugoに移行している人をよく見かけるけど、今のところは記事数が少ないのもあって快適。今後コンパイル対象の記事が増えてくると不安だけど、
Jekyll3.0.0betaからは[再生成が必要なファイルのみをコンパイルできるようになる](https://github.com/jekyll/jekyll/pull/3116)みたいなので、今後解消される見込みはあるっぽい。
また長らく更新がなかったOctopressも[大型アップデートの3.0を控えている](http://octopress.org/2015/01/15/octopress-3.0-is-coming/)ようだし、まだまだJekyll界隈は面白そう。
