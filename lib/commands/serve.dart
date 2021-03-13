import 'dart:io' as io;
import 'package:args/command_runner.dart';
import 'package:mime/mime.dart' as mime;
import 'package:path/path.dart' as path;

class ServeCommand extends Command {
  final name = "serve";
  final description = "Launch local preview server";

  ServeCommand() {
    argParser.addFlag('all', abbr: 'a');
  }

  void run() async {
    await runServer('_site');
  }

  Future<void> runServer(String basePath) async {
    final server = await io.HttpServer.bind('127.0.0.1', 4100);
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
