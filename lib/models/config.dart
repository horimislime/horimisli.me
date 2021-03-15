import 'dart:io' as io;
import 'package:yaml/yaml.dart';

class Config {
  String title;
  String author;
  String description;
  String urlString;
  int entryPerPage;
  List<String> includeFileNames;

  Config._(this.title, this.author, this.description, this.urlString,
      this.entryPerPage, this.includeFileNames);

  static Future<Config> load({String configFilePath = '_config.yml'}) async {
    final configString = await io.File(configFilePath).readAsString();
    final config = loadYaml(configString);

    return Config._(
        config['title'],
        config['author'],
        config['description'],
        config['url'],
        config['paginate'],
        (config['include'] as YamlList ?? []).cast<String>().toList());
  }
}
