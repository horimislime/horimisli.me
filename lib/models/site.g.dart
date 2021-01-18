// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'site.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Site _$SiteFromJson(Map<String, dynamic> json) {
  return Site(
    json['title'] as String,
    json['author'] as String,
    json['description'] as String,
    json['baseUrl'] as String,
    json['url'] as String,
  );
}

Map<String, dynamic> _$SiteToJson(Site instance) => <String, dynamic>{
      'title': instance.title,
      'author': instance.author,
      'description': instance.description,
      'baseUrl': instance.baseUrl,
      'url': instance.url,
    };
