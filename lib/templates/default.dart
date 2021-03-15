import 'package:json_annotation/json_annotation.dart';
import 'package:blog/templates/html.dart';

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
