import 'package:args/command_runner.dart';
import 'package:blog/models/config.dart';
import 'package:blog/site_generator.dart';

class BuildCommand extends Command {
  final name = "build";
  final description = "Build site";
  SiteGenerator _builder;

  BuildCommand() {
    argParser.addFlag('watch', abbr: 'w');
  }

  void run() async {
    final config = await Config.load();
    _builder = SiteGenerator(config);
    await _builder.build();
  }
}
