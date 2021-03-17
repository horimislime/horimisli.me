import 'dart:convert';
import 'package:markdown/markdown.dart' as markdown;
import 'package:path/path.dart' as path;
import 'package:yaml/yaml.dart';
import 'dart:io' as io;

class FrontMatterDocument {
  static const String delimiter = '---';
  final Map<String, dynamic> meta;
  final String body;

  FrontMatterDocument._(this.meta, this.body);

  static FrontMatterDocument parse(String content) {
    final yamlValues = Map<String, dynamic>();
    var body = '';

    final lines = content.split('\n');
    final beginIndex = lines.indexWhere((l) => l == delimiter);
    final endIndex = lines.indexWhere((l) => l == delimiter, beginIndex + 1);

    if (beginIndex == 0) {
      final yamlString = lines.sublist(beginIndex + 1, endIndex).join('\n');

      final map = (loadYaml(yamlString) as YamlMap).nodes;
      for (final key in map.keys) {
        yamlValues[key.value as String] = map[key];
      }
      body = lines.sublist(endIndex + 1).join('\n');
    }
    return FrontMatterDocument._(yamlValues, body);
  }
}

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
    final document = FrontMatterDocument.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.body);
    final fileName = path.posix.basenameWithoutExtension(filePath);

    final dateString = (document.meta['date'] as YamlScalar).value;
    final publishedDate = DateTime.parse(dateString);
    final categories =
        (document.meta['categories'] as YamlList ?? []).cast<String>().toList();
    return Post._((document.meta['title'] as YamlScalar).value, htmlBody,
        publishedDate, categories, fileName);
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
