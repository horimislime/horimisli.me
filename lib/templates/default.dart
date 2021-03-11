import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import '../gen.dart';
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

  String render(Site site, String title, String content) {
    return (_document
          ..title = title
          ..querySelector('.measure')
              .setInnerHtml(content, validator: htmlValidator))
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

    return _layout.render(site, post.title, innerContent);
  }
}

class IndexPageData {
  Site site;
  String title;
  List<Post> posts;
  int page;
  bool hasNext;
  IndexPageData(this.site, this.title, this.posts, this.page, this.hasNext);
}

class IndexPage extends HtmlPage {
  @override
  String htmlFilePath = 'index.html';
  final _layout = DefaultLayout();

  IndexPage() : super();

  HtmlElement _buildEntryList(List<Post> posts) {
    return div(className: 'posts', children: [
      for (final post in posts)
        div(className: 'post', children: [
          Element.p()
            ..className = 'post-meta'
            ..innerText = post.publishedDate.toIso8601String(),
          element('a',
              attributes: {'href': '/entry/${post.pathName}'},
              className: 'post-link',
              children: [
                element('h3', className: 'post-title', innerText: post.title)
              ])
        ])
    ]);
  }

  HtmlElement _buildPagination(int page, bool hasNext) {
    return div(className: 'pagination', children: [
      div(className: 'left', children: [
        if (page == 2)
          a(className: 'pagination-item', href: '/', innerText: 'Newer')
        else
          a(
              className: 'pagination-item',
              href: '/page${page - 1}',
              innerText: 'Newer')
      ]),
      div(className: 'right', children: [
        if (hasNext)
          a(
              className: 'pagination-item',
              href: '/page${page + 1}',
              innerText: 'Older')
      ])
    ]);
  }

  String render(IndexPageData data) {
    final postsElement = _buildEntryList(data.posts);
    final paginationElement = _buildPagination(data.page, data.hasNext);
    final innerContent = (_document
          ..querySelector('.posts').replaceWith(postsElement)
          ..querySelector('.pagination').replaceWith(paginationElement))
        .documentElement
        .innerHtml;
    return _layout.render(data.site, data.title, innerContent);
  }
}
