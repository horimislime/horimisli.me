import 'package:yaml/yaml.dart';

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
