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

Element header({String id, String className, List<Element> children}) {
  return Element.tag('header')
    ..id = id
    ..className = className
    ..nodes = children;
}

DivElement div(
    {String id, String className, List<Element> children, String innerText}) {
  return element('div', id: id, className: className, children: children);
}

Element a(
    {String href,
    String className,
    String innerText,
    Map<String, String> attributes}) {
  final element = Element.a()
    ..setAttribute('href', href)
    ..innerText = innerText;

  if (attributes != null && attributes.isNotEmpty) {
    for (final key in attributes.keys) {
      element.setAttribute(key, attributes[key]);
    }
  }

  return element;
}

Element nav(String className, {String id, List<Element> children}) {
  return element('nav', id: id, className: className, children: children);
}

Element element(String name,
    {String id,
    String className,
    List<Element> children,
    String innerText,
    String innerHtml,
    Map<String, String> attributes}) {
  final tag = Element.tag(name);
  if (id != null) tag.id = id;
  if (className != null) tag.className = className;
  if (innerText != null) tag.innerText = innerText;
  if (innerHtml != null) tag.setInnerHtml(innerHtml, validator: htmlValidator);
  if (children != null) {
    for (final child in children) {
      tag.append(child);
    }
  }
  if (attributes != null && attributes.isNotEmpty) {
    for (final key in attributes.keys) {
      tag.setAttribute(key, attributes[key]);
    }
  }
  return tag;
}
