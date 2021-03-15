import 'package:blog/html_syntax.dart';
import 'package:blog/models/config.dart';
import 'package:blog/models/post.dart';
import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import 'dart:io' as io;
import 'dart:convert';

class HtmlPage {
  static const sanitizer = HtmlEscape();
  String htmlFilePath;
  HtmlDocument _document;
  HtmlPage() {
    final body = io.File(htmlFilePath).readAsStringSync(encoding: utf8);
    final driver = HtmlDriver();
    driver.setDocumentFromContent(body);
    _document = driver.document;

    HtmlElement();
    Node.DOCUMENT_TYPE_NODE;
  }

  String renderJson(Map<String, dynamic> data) {
    var renderedText = _document.documentElement.outerHtml;
    for (final key in data.keys) {
      renderedText = renderedText.replaceAll('{{ $key }}', data[key]);
    }
    return renderedText;
  }
}

class IndexPage extends DefaultPage {
  final List<Post> posts;
  final int pageNo;
  final bool hasNextPage;

  IndexPage(Config config, this.posts, this.pageNo, this.hasNextPage)
      : super(config, '${config.title} (page $pageNo)');

  HtmlElement _buildEntryList() {
    return DivElement()
      ..className = 'posts'
      ..children = [
        for (final post in posts)
          DivElement()
            ..className = 'post'
            ..children = [
              Element.p()
                ..className = 'post-meta'
                ..innerText = post.publishedDate.toIso8601String(),
              Element.a()
                ..attributes = {'href': '/entry/${post.pathName}'}
                ..className = 'post-link'
                ..children = [
                  HeadingElement.h3()
                    ..className = 'post-title'
                    ..innerText = post.title
                ]
            ]
      ];
  }

  HtmlElement _buildPagination() {
    return DivElement()
      ..className = 'pagination'
      ..children = [
        DivElement()
          ..className = 'left'
          ..children = [
            if (pageNo == 2)
              Element.a()
                ..className = 'pagination-item'
                ..attributes = {'href': '/'}
                ..innerText = 'Newer'
            else
              Element.a()
                ..className = 'pagination-item'
                ..attributes = {'href': '/page${pageNo - 1}'}
                ..innerText = 'Newer'
          ],
        DivElement()
          ..className = 'right'
          ..children = [
            if (hasNextPage)
              Element.a()
                ..className = 'pagination-item'
                ..attributes = {'href': '/page${pageNo + 1}'}
                ..innerText = 'Older'
          ]
      ];
  }

  @override
  String build({HtmlElement contentElement}) {
    final homeContent = DivElement()
      ..className = 'home'
      ..children = [_buildEntryList(), _buildPagination()];
    return super.build(contentElement: homeContent);
  }
}

class DefaultPage {
  Config config;
  String title;

  DefaultPage(this.config, this.title);

  List<HtmlElement> _buildHeadElements() {
    return [
      TitleElement()..innerText = title,
      MetaElement()..attributes = {'charset': 'utf-8'},
      MetaElement()
        ..attributes = {'http-equiv': 'X-UA-Compatible', 'content': 'IE-edge'},
      MetaElement()
        ..attributes = {
          'viewport': 'width=device-width, initial-scale=1',
        },
      MetaElement()
        ..attributes = {
          'alternate': 'application/rss+xml',
          'title': title,
          'href': '/feed.xml'
        },
      LinkElement()
        ..rel = 'stylesheet'
        ..href = '/resources/style.css'
        ..type = 'text/css',
      LinkElement()
        ..rel = 'stylesheet'
        ..href = '/resources/vendor/agate.min.css'
        ..type = 'text/css',
      MetaElement()
        ..attributes = {
          'rel': 'apple-touch-icon',
          'sizes': '180x180',
          'href': '/resources/apple-touch-icon.png'
        },
      MetaElement()
        ..attributes = {
          'icon': 'image/png',
          'href': '/resources/favicon.png',
          'sizes': '16x16'
        },
    ];
  }

  List<HtmlElement> _buildBodyElements(HtmlElement contentElement) {
    return [
      Element.header()
        ..className = 'site-header'
        ..children = [
          Element.a()
            ..className = 'site-title'
            ..attributes = {'href': '/'}
            ..innerText = '🏠 ${config.title}'
        ],
      DivElement()
        ..className = 'measure'
        ..childNodes.add(contentElement),
      HRElement(),
      Element.footer()..setInnerHtml('''
      ©︎ 2021 horimislime <br>
      Served by <a href="https://github.com/horimislime/horimisli.me">horimislime/horimisli.me</a>
      ''', validator: htmlValidator)
    ];
  }

  List<HtmlElement> _buildGoogleAnalyticsTags() {
    return [
      ScriptElement()
        ..async = true
        ..src = 'https://www.googletagmanager.com/gtag/js?id=UA-30891696-5',
      ScriptElement()
        ..innerText = '''
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-30891696-5');
        '''
    ];
  }

  String build({HtmlElement contentElement}) {
    final doc = HtmlDriver().document
      ..documentElement.attributes = {'lang': 'ja'}
      ..head.children = _buildHeadElements()
      ..body.children = _buildBodyElements(contentElement);
    if (!config.isDev) {
      doc.childNodes.addAll(_buildGoogleAnalyticsTags());
    }
    return doc.documentElement.outerHtml;
  }
}
