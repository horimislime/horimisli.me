import 'dart:convert';
import 'dart:io' as io;
import 'package:front_matter/front_matter.dart' as frontmatter;
import 'package:markdown/markdown.dart' as markdown;
import 'models/site.dart';
import 'models/page.dart';
import 'templates/post.dart';

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
    final raw = io.File(file.path).readAsStringSync(encoding: utf8);
    final document = frontmatter.parse(raw);
    final htmlBody = markdown.markdownToHtml(document.content);

    final page = Page(document.data['title'], DateTime.now(), ['blog', 'test'],
        htmlBody, 'horimisli.me/entry/example/');

    final element = EntryLayout(site: site, page: page).build();

    final outputDirectory = io.Directory('_site/entry/$entryName');
    if (!outputDirectory.existsSync()) {
      outputDirectory.createSync();
    }

    final output = io.File('_site/entry/$entryName/index.html');
    output.writeAsStringSync(element.documentElement.outerHtml);
  }

  final template =
      io.File('_layouts/default.html').readAsStringSync(encoding: utf8);

  print('done');
}
