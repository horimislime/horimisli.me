---
layout: post
title:      "まだObjective-Cで消耗してるの？"
subtitle:   "既存サービスをSwift移行する様々なめりっと"
date:       2014-12-09 12:00:00
author:     "horimislime"
header-img: "img/post-bg-06.jpg"
---

この記事は [CyberAgent エンジニア Advent Calendar 2014](http://www.adventar.org/calendars/358) 9日目の投稿です。  
昨日は[@stormcat24](https://twitter.com/stormcat24) さんの[開発効率化への道は一日にしてならず - tehepero note(・ω<)](http://stormcat.hatenablog.com/entry/2014/12/08/100000) でした。

自分は4ヶ月ほど前にサーバサイドJavaからiOSに転向し、弊社の中で最も息の長い(?)iOSアプリの開発チームにジョインしました。利用者数も多く事業インパクトの大きいアプリですが、ちょっと前からSwift移行を着々と進めています。

Swiftが登場して6ヶ月、ネット上に良い情報が沢山転がっていて目新しい事は書けないんですが、ここでは既存のコードベースをリプレースしながら感じたSwiftの良い所でもまとめてみようと思います。

# 実際に現場で活きている機能
まだ書きはじめて1ヶ月ほどなので、膨大なSwiftの新機能のうち一部しか触れてはいないですが、はやくもコードベースは劇的に良くなってきています。

## 名前空間の登場でクラスPrefixが不要に
ご存知の通り、Swiftでは"AMB"ViewControllerといったようなPrefixをクラスに付ける必要がなくなりました。これによってAPI、JSON、Photo といったようなジェネリックでシンプルな命名が可能になったのは(主に精神的に)大きいです。

既存サービスをリプレースしていく場合、ほぼ確実にObjective-C側でもSwiftコードを利用する事になると思います。そのため名前のバッティングも考慮する必要がありますが、Swiftクラスでは `@objc` attributeを使うことでクラス名を変更せずObjective-C上での名前競合を回避できます。

```swift
@objc(AMBJson)
class Json {
...
}
```

## パワフルになったEnum
SwiftのEnumはObjective-Cとは比べ物にならないレベルで表現力がアップして おり、個人的にはこれだけでも移行する価値ありと感じています。

中でも、[Alamofireの機能](https://github.com/Alamofire/Alamofire#type-safe-routing)で採用されているAPIルーティングをEnumで組み立てるパターンが気に入っています。

```swift
enum APIRouter: URLStringConvertible {
    static let baseURLString = "http://api.example.com"

    case User(String)
    case Entry(String, Int)

    var URLString: String {
        let path: String = {
            switch self {
                case .User(let userId):
                    return "/user/\(userId)"

                case .Entry(let userId, let entryId):
                    return "/user/\(userId)/entry/\(entryId)/"
            }
        }()
        return APIRouter.baseURLString + path
    }
}
```

このようなEnumを用意しておけば、AlamofireでのHTTPリクエストはとてもシンプルに記述できます。

```swift
// GET http://api.example.com/user/horimislime/entry/1234

Alamofire.request(.GET, APIRouter.Entry("horimislime", 1234))
```

protocol、内部メソッドの定義、private他スコープが指定できるなど、豊富な新機能でObjective-C時代では到底不可能だった使い方ができるようになっています。

## 変数の変更監視
Swiftでは`didset`・`willset`ブロックを使うことで、プロパティへの代入前後で任意の処理を行えます。実際の使いどころとしては、以下のようにIBOutletで繋いだビューが初期化されたタイミングで任意のレイアウト処理を行いたい時などに利用しています。

```swift
@IBOutlet weak var frameScrollView: FrameScrollView! {
    didSet {
        frameScrollView.bounces = false
    }
}
```

ビューの多いControllerではこうした処理でviewDidLoad等が煩雑になりやすいですが、変数宣言とセットで定形の初期化処理をまとめられるとすっきりします。

また、Swiftでは変数のオーバーライドも可能なため、以下の例のようにUIKitクラスのプロパティ値が変更された事も簡単に検知することができます。

```swift
class CustomScrollView: UIScrollView {
    override var contentOffset: CGFloat {
        didSet {
            // 任意の処理
        }
    }
}
```

Objective-CのKVOと違いクラス外部からプロパティの変更検知はできませんが、変数宣言と監視がセットで記述できるためコードの見通しという点ではメリットが大きいです。

## Computed Properties
Swiftの変数は任意の処理結果を値として取ることができます。

```swift
class Circle: UIView {
    var radian: CGFloat {
        return frame.size.width / 2.0
    }
}
```

サンプルではこういったフレーム計算の類がよく挙げられている気がします。実際自分も複雑なビューでフレームをゴリゴリ弄る際とてもお世話になっています。

## 比較演算子の利用
オブジェクト同士の比較は通常の演算子で行います。カスタムクラスやEnum同士を比較したい場合は専用の演算子を定義しておく必要があります。

```swift
enum TShirts: Int, Comparable {
	case Small
	case Medium
	case Large
}

func <(lhs: TShirts, rhs: TShirts) -> Bool {
	return lhs.rawValue < rhs.rawValue
}

func >(lhs: TShirts, rhs: TShirts) -> Bool {
	return lhs.rawValue > rhs.rawValue
}
```

カスタムクラスでこの機能の恩恵を得る機会は少ないですが、SwiftではObjective-Cほど柔軟に違う型の数値同士を比較できないため、以下のような便利演算子を活用しています。

```swift
func ==(lhs: CGFloat, rhs: Double) -> Bool {
    return lhs == CGFloat(rhs)
}

func >(lhs: CGFloat, rhs: Double) -> Bool {
    return lhs > CGFloat(rhs)
}
...
```

フレーム計算が多い場合、このようにCGFloatと別の型を比較できる演算子を書いておくことで、コードのいたるところで型を合わせる為のwrap処理を書く必要がなくなりスッキリします。

## 関数ネストによる構造化
関数の中に関数を定義できます。ある関数の中での処理を共通化したいけど、処理内容が関数内部に閉じている場合等で利用できそうです。

```swift
@IBAction func buttonTapped(sender: AnyObject) {
    func sendSuccessNotification(message: String) {
        // 処理
    }

    func sendFailureNotification() {
        // 処理
    }

    if (...) {
        sendFailureNotification()
    }

    Model.get(id: "abcd") { record, error in
        if error != nil {
            sendFailureNotification()
            return
        }
        ...
        sendSuccessNotification("success!!")
    }
}
```

・・ただ、こういうのが必要なケースはそもそもリファクタリングする必要があるような気もするので、あまり良い活用事例ではないかもしれないです。

## map、 filter、 reduce
便利。・・・だと思いますが、イマイチまだ使いこなせてない、というか使い所にでくわしていないです。たまーに使える所を見つけたらfilterとmapをチェインさせて一人ドヤァしています。

## 良い事だらけのSwift、ただし問題点も・・
ここで紹介した機能だけでも十分移行価値があると思ってますが、まだまだSwiftとその周辺環境が発展途上のために問題も残っています。特にCocoaPodsが未だSwiftライブラリに対応していない為、依存ライブラリの管理が難しい点は大きいです。Swift対応は着実に進んでいるようですが、まだしばらくは依存まわりで悩まされる事になりそうです。  
[Support Clang Modules / Frameworks ( swift ) · Issue #2272 · CocoaPods/CocoaPods](https://github.com/CocoaPods/CocoaPods/issues/2272)

それ以外にもSwift固有のバグ・頻繁に変わる言語仕様・XCodeのクラッシュ等細かい点を上げればかなりの数になります。しかし、これらの問題にぶち当たった上でも今Swiftへの移行する事は大正解だと感じています。

## まとめ  
こんな感じで、業務で運用サービスの一部をSwift化する中で良かった機能の紹介でした。他にもジェネリクスなど活用できてない機能が沢山あるので、今後も良い活用事例が作れたら良いなと思います。

今新規でサービスを開発するなら当然Swiftだと思いますが、サービスを運用していてなかなかSwift移行に踏み切れない・・という人もぜひ一部分の導入だけでも試してみてください。

長くなりましたが9日目の記事はこれで終わりです。明日は[sakatake](http://www.adventar.org/users/3954) さんになります。

iOSやSwiftに関する小ネタはQiita Advent Calendar 2014にも書く予定です。

- [iOS Advent Calendar 2014 - Qiita](http://qiita.com/advent-calendar/2014/ios)
- [Swift Advent Calendar 2014 - Qiita](http://qiita.com/advent-calendar/2014/swift)
