import 'package:blog/models/config.dart';
import 'package:blog/models/post.dart';
import 'package:blog/templates/default.dart';
import 'package:blog/html_syntax.dart';

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
  String build({List<HtmlElement> contentElements}) {
    final homeContent = DivElement()
      ..className = 'home'
      ..children = [_buildEntryList(), _buildPagination()];
    return super.build(contentElements: [homeContent]);
  }
}
