import 'package:blog/html.dart';
import 'package:blog/models/config.dart';

class DefaultPage {
  final Config config;
  final String title;

  DefaultPage(this.config, this.title);

  List<HtmlElement> _buildHeadElements() {
    return [
      TitleElement()..innerText = title,
      MetaElement()..attributes = {'charset': 'utf-8'},
      MetaElement()
        ..attributes = {'http-equiv': 'X-UA-Compatible', 'content': 'IE-edge'},
      MetaElement()
        ..attributes = {
          'viewport': 'width=device-width, initial-scale=1',
        },
      MetaElement()
        ..attributes = {
          'alternate': 'application/rss+xml',
          'title': title,
          'href': '/feed.xml'
        },
      LinkElement()
        ..rel = 'stylesheet'
        ..href = '/resources/style.css'
        ..type = 'text/css',
      LinkElement()
        ..rel = 'stylesheet'
        ..href = '/resources/vendor/agate.min.css'
        ..type = 'text/css',
      MetaElement()
        ..attributes = {
          'rel': 'apple-touch-icon',
          'sizes': '180x180',
          'href': '/resources/apple-touch-icon.png'
        },
      MetaElement()
        ..attributes = {
          'icon': 'image/png',
          'href': '/resources/favicon.png',
          'sizes': '16x16'
        },
    ];
  }

  List<HtmlElement> _buildBodyElements(List<HtmlElement> contentElements) {
    return [
      Element.header()
        ..className = 'site-header'
        ..children = [
          Element.a()
            ..className = 'site-title'
            ..attributes = {'href': '/'}
            ..innerText = '🏠 ${config.title}'
        ],
      DivElement()
        ..className = 'measure'
        ..childNodes.addAll(contentElements),
      HRElement(),
      Element.footer()..setInnerHtml('''
      ©︎ 2021 horimislime <br>
      Served by <a href="https://github.com/horimislime/horimisli.me">horimislime/horimisli.me</a>
      ''', validator: htmlValidator)
    ];
  }

  List<HtmlElement> _buildGoogleAnalyticsTags() {
    return [
      ScriptElement()
        ..async = true
        ..src = 'https://www.googletagmanager.com/gtag/js?id=UA-30891696-5',
      ScriptElement()
        ..innerText = '''
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-30891696-5');
        '''
    ];
  }

  String build({List<HtmlElement> contentElements}) {
    final doc = HtmlDriver().document
      ..documentElement.attributes = {'lang': 'ja'}
      ..head.children = _buildHeadElements()
      ..body.children = _buildBodyElements(contentElements);
    if (!config.isDev) {
      doc.childNodes.addAll(_buildGoogleAnalyticsTags());
    }
    return doc.documentElement.outerHtml;
  }
}
