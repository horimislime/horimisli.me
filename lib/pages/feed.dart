import 'package:blog/models/config.dart';
import 'package:blog/models/post.dart';
import 'package:blog/html.dart';

class Feed {
  final Config config;
  final List<Post> posts;
  Feed(this.config, this.posts);

  Element _buildRssElement() {
    return Element.tag('rss')
      ..attributes = {
        'version': '2.0',
        'xmlns:atom': 'http://www.w3.org/2005/Atom'
      }
      ..children = [
        Element.tag('channel')
          ..children = [
            TitleElement()..innerText = config.title,
            Element.tag('description')..innerText = config.description,
            Element.tag('link')..innerText = config.urlString,
            Element.tag('atom:link')
              ..attributes = {
                'href': '/feed.xml',
                'rel': 'self',
                'type': 'application/rss+xml'
              }
          ],
        for (final post in posts)
          Element.tag('item')
            ..children = [
              TitleElement()..innerText = post.title,
              Element.tag('description')..innerText = post.htmlBody,
              Element.tag('pubDate')
                ..innerText = post.publishedDate.toIso8601String(),
              Element.tag('link')
                ..innerText = '${config.urlString}/${post.pathName}',
              Element.tag('guid')
                ..attributes = {'isPermaLink': 'true'}
                ..innerText = '${config.urlString}/${post.pathName}'
            ]
      ];
  }

  String build() {
    return '<?xml version="1.0" encoding="UTF-8"?>' +
        _buildRssElement().outerHtml;
  }
}
