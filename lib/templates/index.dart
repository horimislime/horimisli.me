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
