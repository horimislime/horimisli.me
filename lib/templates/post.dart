import 'package:blog/templates/default.dart';
import 'package:blog/templates/html.dart';

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
