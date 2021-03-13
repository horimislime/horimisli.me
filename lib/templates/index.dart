import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';

import 'package:blog/models/post.dart';
import 'package:blog/models/site.dart';
import 'package:blog/templates/default.dart';
import 'package:blog/templates/html.dart';
import 'package:blog/html_syntax.dart';

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
    final homeContent = div(className: 'home', children: [
      _buildEntryList(data.posts),
      _buildPagination(data.page, data.hasNext)
    ]);
    return _layout.render(LayoutData(data.title, homeContent.innerHtml));
  }
}
