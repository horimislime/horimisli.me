import 'package:args/command_runner.dart';
import 'package:blog/models/page.dart';
import 'package:blog/models/post.dart';
import 'package:blog/models/site.dart';
import 'package:blog/templates/index.dart';
import 'package:blog/templates/post.dart';
import 'dart:io' as io;

class BuildCommand extends Command {
  final name = "build";
  final description = "Build site";

  BuildCommand() {
    argParser.addFlag('watch', abbr: 'w');
  }

  void run() async {
    await Future.wait([buildPosts(), copyAssets()]);
  }

  Future<void> buildPosts() async {
    print('Compiling posts...');
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
      print('wrote ${output.path}');
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
        print('wrote ${output.path}');
      } else {
        final output = io.File('_site/page${i + 1}/index.html');
        output.writeAsStringSync(renderedHtml);
        print('wrote ${output.path}');
      }
    }

    print('Done.');
  }

  Future<void> copyAssets() async {}
}
