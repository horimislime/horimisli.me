import 'package:json_annotation/json_annotation.dart';
import 'package:universal_html/driver.dart';
import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import '../gen.dart';
import '../models/site.dart';
import 'dart:io' as io;
import 'dart:convert';
import 'package:blog/html_syntax.dart';

class HtmlPage {
  static const sanitizer = HtmlEscape();
  String htmlFilePath;
  HtmlDocument _document;
  HtmlPage() {
    final body = io.File(htmlFilePath).readAsStringSync(encoding: utf8);
    final driver = HtmlDriver();
    driver.setDocumentFromContent(body);
    _document = driver.document;
  }

  String renderJson(Map<String, dynamic> data) {
    var renderedText = _document.documentElement.outerHtml;
    for (final key in data.keys) {
      final value = sanitizer.convert(data[key]);
      renderedText = renderedText.replaceAll('{{ $key }}', value);
    }
    return renderedText;
  }
}

@JsonSerializable()
class LayoutData {
  String title;
  String content;
  LayoutData(this.title, this.content);
  Map<String, dynamic> toJson() => {'title': title, 'content': content};
}

class BaseLayout extends HtmlPage {
  @override
  String htmlFilePath = '_layouts/default.html';

  BaseLayout() : super();

  String render(LayoutData data) {
    return renderJson(data.toJson());
  }
}

class PostPageData {
  String title;
  String content;
  String publishedDate;

  PostPageData(this.title, this.content, this.publishedDate);

  Map<String, dynamic> toJson() =>
      {'title': title, 'content': content, 'publishedDate': publishedDate};
}

class PostPage extends HtmlPage {
  @override
  String htmlFilePath = '_layouts/post.html';
  final _layout = BaseLayout();

  PostPage() : super();

  String render(PostPageData data) {
    final pageContent = renderJson(data.toJson());
    return _layout.render(LayoutData(data.title, pageContent));
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
  final _layout = BaseLayout();

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
    return _layout.render(LayoutData(data.title, innerContent));
  }
}
