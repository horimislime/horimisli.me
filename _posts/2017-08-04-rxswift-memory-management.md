---
layout: post
title: RxSwiftにおけるメモリ管理の考え方
date: 2017-08-04 17:08
categories: ["Swift", "Reactive Programming"]
---

RxSwiftは巨大なライブラリだけど、基本概念はとても簡潔で、公式ガイドを読めば裏側の仕組みについて理解を深めることができる。一方で、この基本を抑えていないと思わぬメモリリークを起こしたり、痛い目を見てしまう。

自分も使い始めた頃、見よう見まねで書きながらハマったり疑問を抱いていた所があったので、一度整理してまとめてみる。

## 基礎知識
RxSwiftでObservable等のEventをsubscribeする(=observerを登録する)際、この購読が解除されるタイミングは2パターンある。

以下のようなコードだとAPIとの通信が完了し、Userオブジェクトが取れると購読は解除される。これはイメージ的にPromiseライブラリを使っている時と一緒だと思う。closureの中でselfをcaptureしないよう気をつける所も一緒。

```swift
final class ViewController: UIViewController {
  override func viewDidLoad() {
    super.viewDidLoad()

    APIClient.shared
      .getUser(id: userId)
      .subscribe(onNext: { user in
        ...
      })
  }
}
```

ここで完了とは厳密に言うとEventが`completed` もしくは `error` になった時の事を言う。例えば`next`に状態が変わっただけでは完了扱いにならない。

> When a sequence sends the completed or error event all internal resources that compute sequence elements will be freed.

[RxSwift/GettingStarted.md (Basics) ReactiveX/RxSwift · GitHub](https://github.com/ReactiveX/RxSwift/blob/master/Documentation/GettingStarted.md#basics)

リソースを解放する方法はもう一つ用意されている。Eventをsubscribeした際に戻り値として受け取れる`Disposable`を使う方法。好きなタイミングで解放したい場合は以下のように書くことができる。

```swift
let disposable = event.subscribe(onNext: { ... })
disposable.dispose()
```

disposeすると購読は直ちに解除される。

## DisposeBagによる自動的なリソース解放
Rx系ライブラリのおまじない的なアレ。使い始めた頃とりあえずよくわかんないけど書いとけば安心なやつだ・・・とか思っていた。

実際、DisposeBagは前述のようなオブザーバが破棄されるタイミングがああだこうだと考えずに済むよう、Disposableをよしなに扱ってくれる便利な仕組み。  
仕組みはごくシンプルで、このようにsubscribeで出たゴミをメソッドチェインでゴミ箱に捨てておくと、DisposeBagがよきタイミングでDisposableを破棄してくれる。

```swift
APIClient.shared
  .getUser(id: userId)
  .subscribe(onNext: { user in
    ...
  })
  .addDisposableTo(rx_disposeBag)
```

`addDisposableTo`は引数に渡されたゴミ箱 (DisposeBag)にゴミをinsertしている。

```swift
public func addDisposableTo(_ bag: DisposeBag) {
    bag.insert(self)
}
```

DisposeBagの実装を見てみるとこれまたシンプルで、自身がdeinitされたタイミングで溜まっているゴミを破棄するようになっている。

[RxSwift/DisposeBag.swift at master · ReactiveX/RxSwift · GitHub](https://github.com/ReactiveX/RxSwift/blob/master/RxSwift/Disposables/DisposeBag.swift)

DisposeBagの持ち主（多くの場合UIViewController）が解放された際に、こちらのdeinitも呼ばれ結果的にオブサーバが破棄されてめでたし、という仕組みらしい。

## DisposeBagに捨てないとどうなるのか？
コードによって以下のような書き方をされてる時があって、これってどうなるんだっけ・・・と疑問に思ったことがあったけど、ここまでに書いた通りでEventが`completed`になったタイミングで解放される。逆にcompleteされない状態が長く続く場合は明示的にdisposeしないといけない。

```swift
let _ = APIClient.shared
  .getUser(id: userId)
  .subscribe(onNext: { user in
    ...
  })
```

## Globalに共有されるObservableの罠
Manager等のsharedなオブジェクトにObservable変数があったり、

## まとめ
- Eventのオブザーバが解放されるタイミングは2種類
- DisposeBagを使わないと必ずメモリリークに繋がるわけではないが、使った方が安心
