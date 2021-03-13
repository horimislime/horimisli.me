import 'package:universal_html/driver.dart';
import 'package:universal_html/prefer_universal/html.dart';
import 'dart:io' as io;
import 'dart:convert';

class HtmlPage {
  static const sanitizer = HtmlEscape();
  String htmlFilePath;
  HtmlDocument _document;
  HtmlPage() {
    final body = io.File(htmlFilePath).readAsStringSync(encoding: utf8);
    final driver = HtmlDriver();
    driver.setDocumentFromContent(body);
    _document = driver.document;
  }

  String renderJson(Map<String, dynamic> data) {
    var renderedText = _document.documentElement.outerHtml;
    for (final key in data.keys) {
      renderedText = renderedText.replaceAll('{{ $key }}', data[key]);
    }
    return renderedText;
  }
}
