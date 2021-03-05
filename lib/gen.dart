import 'dart:convert';
import 'dart:io' as io;
import 'package:blog/templates/default.dart';
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'models/site.dart';
import 'models/page.dart';
import 'templates/post.dart';

class Post {
  String title;
  String htmlBody;
  DateTime publishedDate;
  List<String> categories;

  Post._(this.title, this.htmlBody, this.publishedDate, this.categories);

  static Post loadFromFile(String filePath) {
    final raw = io.File(filePath).readAsStringSync(encoding: utf8);
    final document = frontmatter.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.content);
    return Post._(document.data['title'], htmlBody, DateTime.now(), ['test']);
  }
}

void main() {
  final site = Site('horimisli.me', 'horimislime', 'horimislime\'s blog',
      'horimisli.me', 'horimisli.me');

  final postDir = io.Directory('_posts');
  final files = postDir.listSync();
  for (final file in files) {
    final regex =
        RegExp('[0-9]{4}\-[0-9]{2}\-[0-9]{2}\-([0-9a-zA-Z\-]+)\.(md|markdown)');
    final match = regex.firstMatch(file.path);
    if (match == null) {
      print('Skipping file ${file.path}');
      continue;
    }

    final entryName = match.group(1);
    final post = Post.loadFromFile(file.path);
    final test = PostPage();
    final renderedHtml = test.render(site, post);

    final outputDirectory = io.Directory('_site/entry/$entryName');
    if (!outputDirectory.existsSync()) {
      outputDirectory.createSync();
    }

    final output = io.File('_site/entry/$entryName/index.html');
    output.writeAsStringSync(renderedHtml);
  }
}
