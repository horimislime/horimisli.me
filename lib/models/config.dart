import 'dart:io' as io;
import 'package:yaml/yaml.dart';

class Config {
  final String title;
  final String author;
  final String description;
  final String urlString;
  final int entryPerPage;

  final List<String> resourceDirectories = [
    '.well-known',
    'resources',
    '_images'
  ];

  final bool isDev;
  static const int devServerPort = 4100;

  Config._(this.title, this.author, this.description, this.urlString,
      this.entryPerPage, this.isDev);

  static Future<Config> load(
      {String configFilePath = '_config.yml', bool isDev = true}) async {
    final configString = await io.File(configFilePath).readAsString();
    final config = loadYaml(configString);

    return Config._(
        config['title'],
        config['author'],
        config['description'],
        isDev ? 'http://localhost:$devServerPort' : config['url'],
        config['paginate'],
        isDev);
  }
}
