import 'package:blog/html_syntax.dart';
import 'package:blog/models/config.dart';
import 'package:blog/models/post.dart';
import 'package:blog/templates/default.dart';

class PostPage extends DefaultPage {
  final Post post;

  PostPage(Config config, this.post) : super(config, post.title);

  List<HtmlElement> _buildContentElements() {
    return [
      DivElement()
        ..className = 'post-header'
        ..children = [
          SpanElement()
            ..className = 'post-meta'
            ..innerText = post.publishedDate.toIso8601String(),
          HeadingElement.h1()
            ..className = 'post-title'
            ..innerText = post.title
        ],
      Element.tag('main')
        ..attributes = {'role': 'main'}
        ..setInnerHtml(post.htmlBody, validator: htmlValidator),
      ScriptElement()..src = '/resources/vendor/highlight.min.js',
      ScriptElement()..innerText = 'hljs.initHighlightingOnLoad();',
      ScriptElement()
        ..async = true
        ..src = 'https://platform.twitter.com/widgets.js',
      ScriptElement()
        ..src = 'https://tippin.me/buttons/tip.js?0001'
        ..type = 'text/javascript'
    ];
  }

  @override
  String build({List<HtmlElement> contentElements}) {
    final content = _buildContentElements();
    return super.build(contentElements: content);
  }
}
