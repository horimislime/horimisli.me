import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import '../html_syntax.dart';
import '../models/page.dart';
import '../models/site.dart';
import './layout.dart';

abstract class HtmlPage {
  String htmlFilePath;

  void inject(InjectData content) {}
}

class DefaultLayoutData {}

class InjectData {
  Site site;
  String content;
}

class DefaultLayout2 implements HtmlPage {
  @override
  String htmlFilePath;

  @override
  void inject(InjectData content) {
    // TODO: implement inject
  }
}

class PostLayoutData {}

class PostLayout2 extends DefaultLayout2 {
  @override
  String htmlFilePath;
  @override
  void inject(InjectData content) {
    super.inject(content);
  }
}

class DefaultLayout implements Layout {
  String get meta => '''
  
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta charset="utf-8">
  <title>${page.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{% if page.meta_description %}{{ page.meta_description | xml_escape }}{% elsif page.summary %}{{ page.summary | xml_escape }}{% else %}{{ site.description | xml_escape }}{% endif %}">
  <meta name="author" content="{{ site.author }}">
  ${_keywordsTag}
  <link rel="canonical" href="${page.url.replaceAll('index.html', '')}">
  <link rel="alternate" type="application/rss+xml" title="RSS Feed for ${site.title}" href="/feed.xml" />
  <!-- Custom CSS -->
  <link rel="stylesheet" href="/resources/style.css?${site.time}" type="text/css">
  <!-- Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/resources/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="/resources/favicon.png" sizes="16x16">
  <link rel="stylesheet" href="/resources/vendor/agate.min.css">
  ''';

  String get _keywordsTag {
    return page.categories.isNotEmpty
        ? '<meta name="keywords" content="${page.categories.join(', ')}">'
        : '';
  }

  List<Node> _buildHead() {
    return [
      element('meta'),
    ];
  }

  Node _buildBody(Node innerContent) {
    return div(children: [
      div(className: 'site-wrap', children: [
        header(className: 'site-header px2 px-responsive', children: [
          div(className: 'mt2 wrap', children: [
            div(className: 'measure', children: [
              a(href: '/', className: 'site-title', innerText: site.title),
              nav('site-nav',
                  children: [a(href: '/about', innerText: 'About')]),
              div(className: 'clearfix')
            ])
          ])
        ]),
        div(className: 'post p2 p-responsive wrap', children: [
          element('div', className: 'measure', children: [innerContent])
        ])
      ]),
      element('footer', className: 'center', children: [
        div(className: 'measure', children: [
          element('small',
              innerHtml:
                  'Powered by <a href="https://github.com/horimislime/horimisli.me">horimislime/horimisli.me</a>')
        ])
      ])
    ]);
  }

  HtmlDocument build({Node innerContent}) {
    return HtmlDriver().document
      ..head.appendHtml(meta, validator: htmlValidator)
      ..body.append(_buildBody(innerContent))
      ..body
          .append(ScriptElement()..src = '/resources/vendor/highlight.min.js');
  }

  @override
  final Page page;
  @override
  final Site site;
  @override
  DefaultLayout({this.page, this.site});
}
