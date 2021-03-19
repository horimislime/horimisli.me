import 'dart:convert';
import 'dart:io' as io;
import 'package:intl/intl.dart';
import 'package:markdown/markdown.dart' as markdown;
import 'package:path/path.dart' as path;
import 'package:yaml/yaml.dart';
import 'package:blog/models/front_matter.dart';

final _dateFormat = DateFormat('yyyy/MM/dd');

class Post {
  final String title;
  final String htmlBody;
  final DateTime _publishedDate;
  final String publishedDate;
  final List<String> categories;
  final String pathName;
  final bool published;

  Post._(this.title, this.htmlBody, this._publishedDate, this.categories,
      this.pathName, this.published)
      : this.publishedDate = _dateFormat.format(_publishedDate);

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
        b._publishedDate.millisecondsSinceEpoch -
        a._publishedDate.millisecondsSinceEpoch);

    return markdowns;
  }
}
