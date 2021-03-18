import 'dart:convert';
import 'dart:io' as io;
import 'package:markdown/markdown.dart' as markdown;
import 'package:path/path.dart' as path;
import 'package:yaml/yaml.dart';
import 'package:blog/models/front_matter.dart';

class Post {
  String title;
  String htmlBody;
  DateTime publishedDate;
  List<String> categories;
  String pathName;
  bool published;

  Post._(this.title, this.htmlBody, this.publishedDate, this.categories,
      this.pathName, this.published);

  static Post loadFromFile(String filePath) {
    final raw = io.File(filePath).readAsStringSync(encoding: utf8);
    final document = FrontMatterDocument.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.body);
    final fileName = path.posix.basenameWithoutExtension(filePath);

    final dateString = (document.meta['date'] as YamlScalar).value;
    final publishedDate = DateTime.parse(dateString);
    final categories =
        (document.meta['categories'] as YamlList ?? []).cast<String>().toList();
    final published = document.meta['published'] is YamlScalar
        ? document.meta['published'].value
        : true;

    return Post._((document.meta['title'] as YamlScalar).value, htmlBody,
        publishedDate, categories, fileName, published);
  }

  static List<Post> list(String directoryPath) {
    final files = io.Directory(directoryPath).listSync();
    final markdowns = files
        .where((f) {
          final ext = path.posix.extension(f.path);
          return ext == '.md' || ext == '.markdown';
        })
        .map((f) => loadFromFile(f.path))
        .toList();
    markdowns.sort((a, b) =>
        b.publishedDate.millisecondsSinceEpoch -
        a.publishedDate.millisecondsSinceEpoch);

    return markdowns;
  }
}
