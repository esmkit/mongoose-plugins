import "@babel/register";
import "core-js/stable";
import "regenerator-runtime/runtime";

import { runCommand, getCommandAndArgvFromCli } from "../commands/helpers";
import { exit } from "../utils/helpers";

const run = async () => {
	try {
		// recive the command and the arguments input from the cli
		const { command, argv } = getCommandAndArgvFromCli();

		// run the cli command
		await runCommand(command, argv);

		exit();
	} catch (error) {
		exit(error);
	}
};

run();
