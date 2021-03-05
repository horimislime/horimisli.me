import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import '../html_syntax.dart';
import '../models/page.dart';
import '../models/site.dart';
import './default.dart';

class EntryLayout extends DefaultLayout {
  @override
  final Page page;
  @override
  final Site site;
  @override
  EntryLayout({this.page, this.site});

  Node _buildContent() {
    return div(children: [
      div(className: 'ost-header mb2', children: [
        element('h1', innerText: page.title),
        element('span',
            className: 'post-meta',
            innerText: page.publishedAt.toIso8601String()),
      ]),
      element('article', className: 'post-content', innerHtml: page.content),
      div(className: 'share-links', children: [
        div(id: 'twitter-button', children: [
          a(
              href: 'https://twitter.com/share?ref_src=twsrc%5Etfw',
              className: 'twitter-share-button',
              attributes: {'data-show-count': 'false', 'data-size': 'large'},
              innerText: 'Tweet')
        ]),
        element('div',
            id: 'tippin-button', attributes: {'data-dest': 'horimislime'}),
      ]),
      div(className: 'py2 post-footer', children: [
        element('a', attributes: {
          'href': 'https://twitter.com/horimislime',
          'target': '_blank'
        }, children: [
          element('img',
              className: 'avatar', attributes: {'src': '/images/slime.jpg'})
        ])
      ]),
      element('script',
          attributes: {'src': '/resources/vendor/highlight.min.js'}),
      element('script', attributes: {
        'src': 'https://platform.twitter.com/widgets.js',
        'async': '',
        'charset': 'utf-8'
      }),
      element('script', attributes: {
        'src': 'https://tippin.me/buttons/tip.js?0001',
        'type': 'text/javascript'
      }),
      element('script', innerText: 'hljs.initHighlightingOnLoad();'),
    ]);
  }

  @override
  HtmlDocument build({Node innerContent}) {
    // return super.build(innerContent: _buildContent());
  }
}
