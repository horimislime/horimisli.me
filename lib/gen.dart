import 'dart:convert';
import 'dart:io' as io;
import 'package:blog/templates/default.dart';
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'models/site.dart';
import 'package:path/path.dart' as path;

class Post {
  String title;
  String htmlBody;
  DateTime publishedDate;
  List<String> categories;
  String pathName;

  Post._(this.title, this.htmlBody, this.publishedDate, this.categories,
      this.pathName);

  static Post loadFromFile(String filePath) {
    final raw = io.File(filePath).readAsStringSync(encoding: utf8);
    final document = frontmatter.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.content);
    final fileName = path.posix.basenameWithoutExtension(filePath);
    return Post._(
        document.data['title'], htmlBody, DateTime.now(), ['test'], fileName);
  }

  static List<Post> list(String directoryPath) {
    final files = io.Directory(directoryPath).listSync();
    final markdowns = files.where((f) {
      final ext = path.posix.extension(f.path);
      return ext == '.md' || ext == '.markdown';
    });
    return markdowns.map((f) => loadFromFile(f.path)).toList();
  }
}

void main() {
  final site = Site('horimisli.me', 'horimislime', 'horimislime\'s blog',
      'horimisli.me', 'horimisli.me');

  final posts = Post.list('_posts');
  for (final post in posts) {
    final test = PostPage();
    final renderedHtml = test.render(site, post);

    final outputDirectory = io.Directory('_site/entry/${post.pathName}');
    if (!outputDirectory.existsSync()) {
      outputDirectory.createSync();
    }

    final output = io.File('_site/entry/${post.pathName}/index.html');
    output.writeAsStringSync(renderedHtml);
  }

  final indexData = IndexPageData()
    ..posts = posts
    ..site = site
    ..title = site.title;
  final indexPage = IndexPage();
  final renderedHtml = indexPage.render(indexData);
  final output = io.File('_site/index.html');
  output.writeAsStringSync(renderedHtml);
}
