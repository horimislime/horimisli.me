import 'package:meta/meta.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';

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

class DefaultLayout implements Layout {
  String get meta => '''
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${page.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{% if page.meta_description %}{{ page.meta_description | xml_escape }}{% elsif page.summary %}{{ page.summary | xml_escape }}{% else %}{{ site.description | xml_escape }}{% endif %}">
  <meta name="author" content="{{ site.author }}">
  ${page.categories.isNotEmpty ? '<meta name="keywords" content="${page.categories.join(', ')}">' : ''}
  <link rel="canonical" href="${page.url.replaceAll('index.html', '')}">
  <link rel="alternate" type="application/rss+xml" title="RSS Feed for ${site.title}" href="/feed.xml" />
  <!-- Custom CSS -->
  <link rel="stylesheet" href="/resources/style.css?${site.time}" type="text/css">
  <!-- Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/resources/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="/resources/favicon.png" sizes="16x16">
  <link rel="stylesheet" href="/resources/vendor/agate.min.css">
  ''';

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
    return document
      // ..append(ScriptElement()..async = true)
      ..head.appendHtml(meta)
      ..body.appendHtml(body(injectionContent));
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
  final page = Page('Entry test', DateTime.now(), ['blog', 'test'], 'body text',
      'horimisli.me/entry/example/');

  final element = EntryLayout(site: site, page: page).build();
  print(element.documentElement.outerHtml);
  final doc = Document();
  print(doc.toString());
}