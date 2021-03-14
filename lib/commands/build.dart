import 'package:args/command_runner.dart';
import 'package:blog/site_builder.dart';

class BuildCommand extends Command {
  final name = "build";
  final description = "Build site";
  SiteBuilder _builder;

  BuildCommand() {
    argParser.addFlag('watch', abbr: 'w');
    _builder = SiteBuilder();
  }

  void run() async {
    await _builder.build();
  }
}
