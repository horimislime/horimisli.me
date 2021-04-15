import 'package:universal_html/html.dart';
import 'package:universal_html/prefer_universal/html.dart';
import 'package:universal_html/driver.dart';

export 'package:universal_html/prefer_universal/html.dart';
export 'package:universal_html/driver.dart';

class CustomUriPolicy implements UriPolicy {
  @override
  bool allowsUri(String uri) => true;
}

final NodeValidatorBuilder htmlValidator = NodeValidatorBuilder.common()
  ..allowElement('a',
      attributes: ['href', 'data-size', 'data-show-count'],
      uriPolicy: CustomUriPolicy())
  ..allowElement('iframe',
      attributes: ['scrolling', 'src'], uriPolicy: CustomUriPolicy())
  ..allowElement('img', attributes: ['src'], uriPolicy: CustomUriPolicy())
  ..allowElement('script',
      attributes: ['async', 'charset', 'src', 'type', 'data-id', 'data-ratio'],
      uriPolicy: CustomUriPolicy())
  ..allowElement('div', attributes: ['role', 'data-dest'])
  ..allowElement('blockquote', attributes: [
    'data-instgrm-version',
    'data-instgrm-permalink',
    'data-instgrm-captioned'
  ])
  ..allowElement('g', attributes: [
    'stroke',
    'transform',
    'fill',
    'fill-rule',
    'stroke-width',
    'viewbox',
    'version',
    'height',
    'width'
  ])
  ..allowElement('svg')
  ..allowElement('time', attributes: ['datetime'])
  ..allowElement('main', attributes: ['role'])
  ..allowSvg()
  ..allowInlineStyles();
