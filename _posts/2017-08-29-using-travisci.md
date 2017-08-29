---
layout: post
title: TravisCIでFirebase Hostingへのデプロイを自動化
date: 2017-08-29 10:00
categories: ["Development"]
---

このサイトのソースはずっとGitHubのPrivateリポジトリで運用してたんだけど、  [horimislime/horimisli.me](https://github.com/horimislime/horimisli.me) としてPublicに公開した。それによりCI系サービスがタダで使える事になったので、TravisCIを利用してデプロイを自動化した。

Travisでは公式にFirebaseへのデプロイがサポートされており、詳細なドキュメントも用意されている。おかげで自動デプロイの環境がすぐに用意できた。e

[Firebase Deployment - Travis CI](https://docs.travis-ci.com/user/deployment/firebase/)

最終的な `.travis.yml` は下記のような感じ。一箇所だけハマったのは `skip_cleanup: true` の部分。これがないとTravisはdeploy前にworking directory内の差分を全てクリーンしてしまうため、jekyllで生成したサイトのデータが消え、Firebaseにデプロイされない。それ以外はドキュメントの内容を真似するだけで完成した。

```yaml
language: node_js
node_js:
- 6.11.0
before_install:
- rvm install 2.3.1
install:
  - npm install -g gulp-cli
  - npm install
  - gem install bundler
  - bundle install --path vendor/bundle
branches:
  only:
    - master
script:
  - bundle exec gulp publish
deploy:
  provider: firebase
  skip_cleanup: true
  token:
    secure: $FIREBASE_TOKEN
  project: $FIREBASE_PROJECT
```

[horimisli.me/.travis.yml at master · horimislime/horimisli.me](https://github.com/horimislime/horimisli.me/blob/master/.travis.yml)

普段仕事ではCircleCIを便利に使っているんだけど、Travisは[Deploy周りが抽象化](https://docs.travis-ci.com/user/deployment)されていたり [Cron Jobs](https://docs.travis-ci.com/user/cron-jobs/) があったりと、自動化内容によってはCircleCIよりかなり楽ができて良いなと思った。
