import 'package:args/command_runner.dart';
import 'package:blog/models/config.dart';
import 'package:blog/site_builder.dart';

class BuildCommand extends Command {
  final name = "build";
  final description = "Build site";
  SiteBuilder _builder;

  BuildCommand() {
    argParser.addFlag('watch', abbr: 'w');
  }

  void run() async {
    final config = await Config.load();
    _builder = SiteBuilder(config);
    await _builder.build();
  }
}
