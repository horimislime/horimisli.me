---
title: "Swift1.2で演算子の挙動が微妙に変わった"
date: "2015-04-10"
layout: post
---

Xcode6.3を入れて遊んでたら、6.2時代に発生してた演算子まわりの問題が解決されてる事に気づいた。

例えば以下の様な演算を例に。

```swift
let result = 2.0 / CGFloat(2.0)
```

Swiftでは型が明示されていない浮動小数点数は暗黙的にDouble型として扱われる。例外として、この演算式の分母のように式中で型の決まった値がある場合はその型に合わせてくれる。つまり、この例だと分子の2.0がCGFloatになり左辺に格納される型もCGFloat型となる。

しかし、XCode6.2以前では以下のような演算子を定義しているとこの挙動が変わってくる。

```swift
func / (lhs: Double, rhs: CGFloat) -> Double { return lhs / Double(rhs) }

let result1 = 2.0 / CGFloat(2.0)      // Double型
let result2 = result1 * CGFloat(2.0)  // Error!!
```

result1の除算では`func / (lhs: CGFloat, rhs: CGFloat) -> CGFloat`が呼ばれるはずが、上に定義した演算子が呼び出されているらしい。

DoubleとCGFloat同士を計算する演算子はフレームをゴリゴリ弄るコードでは必要不可欠なので使うんだけど、
デフォルトの挙動を変えちゃってるからなんだかな〜と思っていたら、Xcode6.3にアップデしたマシンではこの問題が発生しない事に気づいた。
上記の`result1`右辺の分子はCGFloat型として扱われて、カスタム演算子は呼ばれない。

結論、Xcodeをアプデすれば解決された。たぶん演算子の優先順位に変更があったのかな？Swift1.2、こういう細かい変更がまだまだありそう。
