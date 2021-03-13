import 'dart:convert';
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'package:path/path.dart' as path;
import 'package:yaml/yaml.dart';
import 'dart:io' as io;

class FrontMatter {
  static const String delimiter = '---';
  static Map<String, dynamic> parse(String content) {
    var beganFrontMatterBlock = false;
    final yamlValues = List<String>();
    for (final line in content.split('\n')) {
      if (line == delimiter) {
        if (beganFrontMatterBlock) {
          break;
        }
        beganFrontMatterBlock = true;
        continue;
      }

      if (beganFrontMatterBlock) {
        yamlValues.add(line);
      }
    }

    final map = (loadYaml(yamlValues.join('\n')) as YamlMap).nodes;

    final result = Map<String, dynamic>();
    for (final key in map.keys) {
      result[key.value as String] = map[key];
    }
    return result;
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
    final document = frontmatter.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.content);
    final fileName = path.posix.basenameWithoutExtension(filePath);

    final dateString = document.data['date'];
    final publishedDate = DateTime.parse(dateString);
    final categories =
        (document.data['categories'] as YamlList ?? []).cast<String>().toList();
    return Post._(
        document.data['title'], htmlBody, publishedDate, categories, fileName);
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
