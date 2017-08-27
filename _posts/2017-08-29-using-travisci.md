---
layout: post
title: TravisCIでFirebase Hostingへのデプロイを自動化
date: 2017-08-29 10:00
categories: ["Development"]
---

このサイトのソースはずっとGitHubのPrivateリポジトリで運用してたんだけど、 [horimislime/horimisli.me](https://github.com/horimislime/horimisli.me)としてPublicに公開した。それによりCI系サービスがタダで使える事になったので、TravisCIを利用してデプロイを自動化した。

CircleCI等ではなくTravisを選んだ最大の理由は [Cron Jobs](https://docs.travis-ci.com/user/cron-jobs/) が使えるから。例えばこれを使って毎朝10時に定期ビルドを回すようにすれば、前日に書いておいた記事を翌日に自動公開するみたいな事ができる。

更にTravisでは公式にFirebaseへのデプロイがサポートされており、詳細なドキュメントも用意されている。おかげですぐ自動デプロイの環境が用意できた。

[Firebase Deployment - Travis CI](https://docs.travis-ci.com/user/deployment/firebase/)

最終的な `.travis.yml` は下記のような感じ。すごくシンプルで良い。

```yaml
language: node_js
node_js:
  - 6.11.0
before_install:
  - rvm install 2.3.1
branches:
  only:
  - master
install:
  - npm install
  - gem install bundler
  - bundle install --path vendor/bundle
script:
  - bundle exec jekyll build
deploy:
  provider: firebase
  token:
    secure: $FIREBASE_TOKEN
  project: $FIREBASE_PROJECT
```

[horimisli.me/.travis.yml at master · horimislime/horimisli.me](https://github.com/horimislime/horimisli.me/blob/master/.travis.yml)
