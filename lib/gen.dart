import 'package:args/command_runner.dart';
import 'package:blog/commands/build.dart';
import 'package:blog/commands/serve.dart';

void main(List<String> args) async {
  CommandRunner("blog", "Blog builder")
    ..addCommand(BuildCommand())
    ..addCommand(ServeCommand())
    ..run(args);
}
