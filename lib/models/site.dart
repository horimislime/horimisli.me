import 'package:json_annotation/json_annotation.dart';
part 'site.g.dart';

@JsonSerializable()
class Site {
  final String title;
  final String author;
  final String description;
  final String baseUrl;
  final String url;
  final DateTime time;

  Site(this.title, this.author, this.description, this.baseUrl, this.url)
      : time = DateTime.now();
}
