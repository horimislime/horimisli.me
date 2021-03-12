import 'dart:convert';
import 'dart:io' as io;
import 'package:blog/templates/default.dart';
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'models/site.dart';
import 'package:path/path.dart' as path;
import 'package:yaml/yaml.dart';

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

void main() {
  final site = Site('horimisli.me', 'horimislime', 'horimislime\'s blog',
      'horimisli.me', 'horimisli.me');

  final posts = Post.list('_posts');
  for (final post in posts) {
    final test = PostPage();
    final renderedHtml = test.render(PostPageData(
        site.title, post.htmlBody, post.publishedDate.toIso8601String()));

    final outputDirectory = io.Directory('_site/entry/${post.pathName}');
    if (!outputDirectory.existsSync()) {
      outputDirectory.createSync();
    }

    final output = io.File('_site/entry/${post.pathName}/index.html');
    output.writeAsStringSync(renderedHtml);
  }

  final paginator = Paginator(posts, 10);
  for (var i = 0; i < paginator.pages.length; i++) {
    final page = paginator.pages[i];
    final indexData =
        IndexPageData(site, site.title, page.items, i + 1, page.hasNext);
    final indexPage = IndexPage();
    final renderedHtml = indexPage.render(indexData);

    if (!page.hasPrev) {
      final output = io.File('_site/index.html');
      output.writeAsStringSync(renderedHtml);
    } else {
      final output = io.File('_site/page${i + 1}/index.html');
      output.writeAsStringSync(renderedHtml);
    }
  }
}

class Page<T> {
  List<T> items;
  bool hasPrev;
  bool hasNext;
  Page(this.items, this.hasPrev, this.hasNext);
}

class Paginator<T> {
  final pages = List<Page<T>>();

  Paginator(List<T> items, int itemsPerPage) {
    final chunkedList = chunk(items, itemsPerPage);

    for (var i = 0; i < chunkedList.length; i++) {
      final hasPrev = i > 0;
      final hasNext = i < chunkedList.length - 1;
      pages.add(Page(chunkedList[i], hasPrev, hasNext));
    }
  }

  List<List<T>> chunk(List<T> items, int chunkSize) {
    final chunkCount = (items.length / chunkSize).ceil();
    return List.generate(
        chunkCount, (i) => items.skip(chunkSize * i).take(chunkSize).toList());
  }
}
