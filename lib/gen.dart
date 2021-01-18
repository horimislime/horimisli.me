import 'dart:convert';
import 'dart:io' as io;
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'package:meta/meta.dart';
import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import 'models/site.dart';
import 'html_syntax.dart';

class Page {
  final String title;
  final DateTime publishedAt;
  final List<String> categories;
  final String content;
  final String url;
  Page(this.title, this.publishedAt, this.categories, this.content, this.url);
}

abstract class Layout {
  final Site site;
  final Page page;
  Layout({@required this.site, @required this.page});
}

class CustomUriPolicy implements UriPolicy {
  @override
  bool allowsUri(String uri) => true;
}

final NodeValidatorBuilder htmlValidator = NodeValidatorBuilder.common()
  ..allowElement('a',
      attributes: ['href', 'data-size', 'data-show-count'],
      uriPolicy: CustomUriPolicy())
  ..allowElement('iframe',
      attributes: ['scrolling', 'src'], uriPolicy: CustomUriPolicy())
  ..allowElement('img', attributes: ['src'], uriPolicy: CustomUriPolicy())
  ..allowElement('script',
      attributes: ['async', 'charset', 'src', 'type', 'data-id', 'data-ratio'],
      uriPolicy: CustomUriPolicy())
  ..allowElement('div', attributes: ['role', 'data-dest'])
  ..allowElement('blockquote', attributes: [
    'data-instgrm-version',
    'data-instgrm-permalink',
    'data-instgrm-captioned'
  ])
  ..allowElement('g', attributes: [
    'stroke',
    'transform',
    'fill',
    'fill-rule',
    'stroke-width',
    'viewbox',
    'version',
    'height',
    'width'
  ])
  ..allowElement('svg')
  ..allowElement('time', attributes: ['datetime'])
  ..allowSvg()
  ..allowInlineStyles();

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

class EntryLayout extends DefaultLayout {
  @override
  final Page page;
  @override
  final Site site;
  @override
  EntryLayout({this.page, this.site});

  Node _buildContent() {
    return div(children: [
      div(className: 'ost-header mb2', children: [
        element('h1', innerText: page.title),
        element('span',
            className: 'post-meta',
            innerText: page.publishedAt.toIso8601String()),
      ]),
      element('article', className: 'post-content', innerHtml: page.content),
      div(className: 'share-links', children: [
        div(id: 'twitter-button', children: [
          a(
              href: 'https://twitter.com/share?ref_src=twsrc%5Etfw',
              className: 'twitter-share-button',
              attributes: {'data-show-count': 'false', 'data-size': 'large'},
              innerText: 'Tweet')
        ]),
        element('div',
            id: 'tippin-button', attributes: {'data-dest': 'horimislime'}),
      ]),
      div(className: 'py2 post-footer', children: [
        element('a', attributes: {
          'href': 'https://twitter.com/horimislime',
          'target': '_blank'
        }, children: [
          element('img',
              className: 'avatar', attributes: {'src': '/images/slime.jpg'})
        ])
      ]),
      element('script',
          attributes: {'src': '/resources/vendor/highlight.min.js'}),
      element('script', attributes: {
        'src': 'https://platform.twitter.com/widgets.js',
        'async': '',
        'charset': 'utf-8'
      }),
      element('script', attributes: {
        'src': 'https://tippin.me/buttons/tip.js?0001',
        'type': 'text/javascript'
      }),
      element('script', innerText: 'hljs.initHighlightingOnLoad();'),
    ]);
  }

  @override
  HtmlDocument build({Node innerContent}) {
    return super.build(innerContent: _buildContent());
  }
}

void main() {
  final site = Site('horimisli.me', 'horimislime', 'horimislime\'s blog',
      'horimisli.me', 'horimisli.me');

  final postDir = io.Directory('_posts');
  final files = postDir.listSync();
  for (final file in files) {
    final regex =
        RegExp('[0-9]{4}\-[0-9]{2}\-[0-9]{2}\-([0-9a-zA-Z\-]+)\.(md|markdown)');
    final match = regex.firstMatch(file.path);
    if (match == null) {
      print('Skipping file ${file.path}');
      continue;
    }

    final entryName = match.group(1);
    final raw = io.File(file.path).readAsStringSync(encoding: utf8);
    final document = frontmatter.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.content);

    final page = Page(document.data['title'], DateTime.now(), ['blog', 'test'],
        htmlBody, 'horimisli.me/entry/example/');

    final element = EntryLayout(site: site, page: page).build();

    final outputDirectory = io.Directory('_site/entry/$entryName');
    if (!outputDirectory.existsSync()) {
      outputDirectory.createSync();
    }

    final output = io.File('_site/entry/$entryName/index.html');
    output.writeAsStringSync(element.documentElement.outerHtml);
  }

  final template =
      io.File('_layouts/default.html').readAsStringSync(encoding: utf8);

  print('done');
}
