import 'dart:convert';
import 'dart:io' as io;
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'package:meta/meta.dart';
import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
// import 'dart:html';

class Site {
  final String title;
  final String author;
  final String description;
  final String baseUrl;
  final String url;
  final DateTime time;

  Site(this.title, this.author, this.description, this.baseUrl, this.url)
      : time = DateTime.now();
}

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

class DefaultLayout implements Layout {
  final NodeValidatorBuilder _htmlValidator = NodeValidatorBuilder.common()
    ..allowElement('a',
        attributes: ['href', 'data-size', 'data-show-count'],
        uriPolicy: CustomUriPolicy())
    ..allowElement('iframe',
        attributes: ['scrolling', 'src'], uriPolicy: CustomUriPolicy())
    ..allowElement('img', attributes: ['src'], uriPolicy: CustomUriPolicy())
    ..allowElement('script',
        attributes: [
          'async',
          'charset',
          'src',
          'type',
          'data-id',
          'data-ratio'
        ],
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

  String body(String injectionContent) => '''
  <div class="site-wrap">
    <header class="site-header px2 px-responsive">
      <div class="mt2 wrap">
        <div class="measure">
          <a href="/" class="site-title">${site.title}</a>
          <nav class="site-nav">
            <a href="/about">About</a>
          </nav>
          <div class="clearfix"></div>
        </div>
      </div>
    </header>
    <div class="post p2 p-responsive wrap" role="main">
      <div class="measure">
        ${injectionContent}
      </div>
    </div>
  </div>
  <footer class="center">
    <div class="measure">
      <small>
        Powered by <a href="https://github.com/horimislime/horimisli.me">horimislime/horimisli.me</a>
      </small>
    </div>
  </footer>
  ''';

  HtmlDocument build({String injectionContent = ''}) {
    return HtmlDriver().document
      ..head.appendHtml(meta, validator: _htmlValidator)
      ..body.appendHtml(body(injectionContent), validator: _htmlValidator)
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

  String get content => '''
  <div class="post-header mb2">
  <h1>${page.title}</h1>
  <span class="post-meta">{{ page.date | date: site.date_format }}</span><br>
  {% if page.update_date %}
    <span class="post-meta">{{ page.update_date | date: site.date_format }}</span><br>
  {% endif %}
  </div>
  <article class="post-content">
    ${page.content}
  </article>
  <div class="share-links">
    <div id="twitter-button">
        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false" data-size="large">Tweet</a>
    </div>
    <div id="tippin-button" data-dest="horimislime"></div>
  </div>
  <div class="py2 post-footer">
    <a href="https://twitter.com/horimislime" target="_blank"><img src="/images/slime.jpg" alt="horimislime" class="avatar" /></a>
  </div>
  <script src="/resources/vendor/highlight.min.js"></script>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  <script src="https://tippin.me/buttons/tip.js?0001" type="text/javascript"></script>
  <script>hljs.initHighlightingOnLoad();</script>
  ''';

  @override
  HtmlDocument build({String injectionContent = ''}) {
    return super.build(injectionContent: content);
  }
}

void main() {
  final site = Site('horimisli.me', 'horimislime', 'horimislime\'s blog',
      'horimisli.me', 'horimisli.me');

  final postDir = io.Directory('_posts');
  final files = postDir.listSync();
  for (final file in files) {
    print('Path: ${file.path}');
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
  print('done');
}
