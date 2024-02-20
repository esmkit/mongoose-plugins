import generateUsageGuide from "command-line-usage";
import optionDefinitions from "./option-definitions";

/**
 * @private
 */
const usageGuide = generateUsageGuide([
	{
		header: "Initialize mongoose-seeders",
		content: `Install mongoose-seeders into your project.
      Generate md-seed-generator.js and create seeders folder`,
	},
	{
		header: "Synopsis",
		content: [
			"$ md-seed init [{bold --seedersFolder}={underline folder-name}] [{bold --seederTemplate}={underline file-path}]",
			"$ md-seed init {bold --help}",
		],
	},
	{
		header: "Options",
		optionList: optionDefinitions,
	},
]);

export default usageGuide;
