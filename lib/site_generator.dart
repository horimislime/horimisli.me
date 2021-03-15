import 'dart:io' as io;
import 'package:path/path.dart' as path;
import 'package:blog/models/config.dart';
import 'package:blog/models/page.dart';
import 'package:blog/models/post.dart';
import 'package:blog/templates/index.dart';
import 'package:blog/templates/post.dart';

class SiteGenerator {
  final Config config;

  SiteGenerator(this.config);

  Future<void> build() async {
    return Future.wait([compilePageTasks(), ...copyAssetTasks()]);
  }

  Future<void> createFile(String content, String filePath) async {
    return io.File(filePath)
        .create(recursive: true)
        .then((f) => f.writeAsString(content))
        .then((f) => print('wrote ${f.path}'));
  }

  Future<void> copyFile(String sourcePath, String destinationPath) async {
    return io.File(destinationPath)
        .create(recursive: true)
        .then((destination) =>
            io.File(sourcePath).openRead().pipe(destination.openWrite()))
        .then((_) => print('copied $sourcePath => $destinationPath'));
  }

  Future<void> copyDirectory(String sourcePath, String destinationPath) async {
    return io.Directory(sourcePath).list().forEach((source) {
      final baseName = path.posix.basename(source.path);
      if (baseName.startsWith('.')) {
        return Future.value().then((_) => print('skipping $baseName'));
      }
      final sourceFilePath = '$sourcePath/$baseName';
      final destinationFullPath = '$destinationPath/$baseName';
      if ((source is io.Directory)) {
        return copyDirectory(source.path, destinationFullPath);
      }
      return io.File(destinationFullPath)
          .create(recursive: true)
          .then((destination) =>
              io.File(source.path).openRead().pipe(destination.openWrite()))
          .then((_) => print('copied $sourceFilePath => $destinationFullPath'));
    });
  }

  Future<void> compilePageTasks() async {
    final config = await Config.load();
    final posts = Post.list('_posts');
    final paginator = Paginator(posts, 10);

    return [
      ...posts.map((post) {
        final html = PostPage(config, post).build();
        return createFile(html, '_site/entry/${post.pathName}/index.html');
      }),
      ...paginator.pages.map((page) {
        final html =
            IndexPage(config, page.items, page.pageNo, page.hasNext).build();
        final filePath = page.pageNo == 1
            ? '_site/index.html'
            : '_site/page${page.pageNo}/index.html';
        return createFile(html, filePath);
      })
    ];
  }

  List<Future<void>> copyAssetTasks() {
    return config.resourceDirectories.map((directory) {
      final destination = directory.startsWith('_')
          ? directory.replaceFirst('_', '')
          : directory;
      return copyDirectory(directory, '_site/$destination');
    }).toList();
  }
}
