---
layout: post
title: Firebase Hostingで手軽にSSL・HTTP/2対応のブログを構築する
date: 2017-07-05 00:46
categories:
published: false
---

# ブログデプロイ

# Firebase Hosting

これでめでたくSSL・HTTP/2なブログを設置できた。

# PageSpeedを見ながら最適化
あとはせっかくなのでPageSpeedでスコアが上がるように微調整。まずはFirebaseで静的ファイルのキャッシュが効くよう以下のように設定。

```json
{
  "hosting": {
    "public": "_site",
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      },
      {
        "source": "404.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}

```

そのほかにはgulpで画像やcssのminifyといった細かい調整を。

ここまででスコアは80を超えたので一旦満足。

![](/images/2017/pagespeed.png)
