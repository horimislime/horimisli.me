import 'dart:io' as io;
import 'package:args/command_runner.dart';
import 'package:mime/mime.dart' as mime;
import 'package:path/path.dart' as path;
import 'package:blog/models/config.dart';
import 'package:blog/site_generator.dart';

class BuildCommand extends Command {
  final name = "build";
  final description = "Build site";
  SiteGenerator _builder;
  Config _config;

  BuildCommand() {
    argParser.addFlag('preview', callback: (preview) {
      if (preview) {
        print('Preview enabled');
        runServer('_site');
      }
    });
    argParser.addFlag('watch', abbr: 'w', callback: (watch) {
      if (watch) {
        print('Watching file system events');
        io.Directory('.')
            .watch(recursive: true)
            .where((event) => !event.path.startsWith('./_site'))
            .forEach((_) {
          print('Rebuilding site');
          _builder.build();
        });
      }
    });
  }

  void run() async {
    _config = await Config.load();
    _builder = SiteGenerator(_config);
    await _builder.build();
  }

  Future<void> runServer(String basePath) async {
    final server = await io.HttpServer.bind('127.0.0.1', Config.devServerPort);
    print('Server listening on ${server.address.address}:${server.port}');
    await for (io.HttpRequest request in server) {
      await handleRequest(basePath, request);
    }
  }

  Future<void> handleRequest(String basePath, io.HttpRequest request) async {
    final filePath = request.uri.toFilePath();
    final normalizedFilePath = path.posix.extension(filePath).isEmpty
        ? '$filePath/index.html'
        : filePath;
    final file = io.File('$basePath$normalizedFilePath');
    final mimeTypePair = mime.lookupMimeType(normalizedFilePath).split('/');
    if (await file.exists()) {
      request.response.headers.contentType =
          io.ContentType(mimeTypePair[0], mimeTypePair[1], charset: "utf-8");
      await file.openRead().pipe(request.response);
    } else {
      request.response.statusCode = io.HttpStatus.notFound;
      await request.response.close();
    }
  }
}
