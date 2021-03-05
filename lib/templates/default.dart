import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import '../gen.dart';
import '../models/page.dart';
import '../models/site.dart';
import 'dart:io' as io;
import 'dart:convert';
import 'package:blog/html_syntax.dart';

class HtmlPage {
  String htmlFilePath;
  HtmlDocument _document;
  HtmlPage() {
    final body = io.File(htmlFilePath).readAsStringSync(encoding: utf8);
    final driver = HtmlDriver();
    driver.setDocumentFromContent(body);
    _document = driver.document;
  }
}

class DefaultLayout extends HtmlPage {
  @override
  String htmlFilePath = '_layouts/default.html';

  DefaultLayout() : super();

  String render(Site site, Page page) {
    return (_document
          ..title = page.title
          ..querySelector('.measure')
              .appendHtml(page.content, validator: htmlValidator))
        .documentElement
        .innerHtml;
  }
}

class PostPage extends HtmlPage {
  @override
  String htmlFilePath = '_layouts/post.html';
  final _layout = DefaultLayout();

  PostPage() : super();

  String render(Site site, Post post) {
    final innerContent = (_document
          ..querySelector('.post-meta').innerText =
              post.publishedDate.toIso8601String()
          ..querySelector('.post-title').innerText = post.title
          ..querySelector('main')
              .setInnerHtml(post.htmlBody, validator: htmlValidator))
        .documentElement
        .innerHtml;

    final page = Page()
      ..content = innerContent
      ..title = post.title;
    return _layout.render(site, page);
  }
}

class IndexPageData {
  Site site;
  String title;
  List<Post> posts;
}

class IndexPage extends HtmlPage {
  @override
  String htmlFilePath = 'index.html';
  final _layout = DefaultLayout();

  IndexPage() : super();

  String render(Site site, Page page) {
    final innerContent = (_document
          ..querySelector('.post-meta').innerText =
              page.publishedAt.toIso8601String()
          ..querySelector('.post-title').innerText = page.title
          ..querySelector('main')
              .setInnerHtml(page.content, validator: htmlValidator))
        .documentElement
        .innerHtml;

    return _layout.render(site, page..content = innerContent);
  }
}
