import fs from "fs";
import path from "path";
import memFs from "mem-fs";
import editor from "mem-fs-editor";
import { Subject } from "rxjs";

import { defaultUserGeneratorConfig, systemSeederTemplate } from "../constants";
import config from "../config";

import InstallerError from "./installer-error";

export default class Installer {
	static operations = {
		START: "START",
		SUCCESS: "SUCCESS",
		ERROR: "ERROR",

		WRITE_USER_GENERETOR_CONFIG_START: "WRITE_USER_GENERETOR_CONFIG_START",
		WRITE_USER_GENERETOR_CONFIG_SUCCESS: "WRITE_USER_GENERETOR_CONFIG_SUCCESS",
		WRITE_USER_GENERETOR_CONFIG_ERROR: "WRITE_USER_GENERETOR_CONFIG_ERROR",

		CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_START: "CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_START",
		CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SUCCESS: "CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SUCCESS",
		CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_ERROR: "CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_ERROR",
		CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_FILE_EXISTS: "CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_FILE_EXISTS",
		CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_NO_CUSTOM: "CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_NO_CUSTOM",

		CREATE_SEEDERS_FOLDER_START: "CREATE_SEEDERS_FOLDER_START",
		CREATE_SEEDERS_FOLDER_SUCCESS: "CREATE_SEEDERS_FOLDER_SUCCESS",
		CREATE_SEEDERS_FOLDER_ERROR: "CREATE_SEEDERS_FOLDER_ERROR",
		CREATE_SEEDERS_FOLDER_SKIP_FOLDER_EXISTS: "CREATE_SEEDERS_FOLDER_SKIP_FOLDER_EXISTS",

		WRITE_USER_CONFIG_START: "WRITE_USER_CONFIG_START",
		WRITE_USER_CONFIG_SUCCESS: "WRITE_USER_CONFIG_SUCCESS",
		WRITE_USER_CONFIG_ERROR: "WRITE_USER_CONFIG_ERROR",
		WRITE_USER_CONFIG_SKIP_FILE_EXISTS: "WRITE_USER_CONFIG_SKIP_FILE_EXISTS",
	};

	constructor({ seedersFolder, customSeederTemplate } = defaultUserGeneratorConfig) {
		this._subject = new Subject();
		this._initConfig({ seedersFolder, customSeederTemplate });
		this._initMemFs();
	}

	install() {
		this._install();

		return this._subject.asObservable();
	}

	getGeneratorConfig() {
		const { userSeedersFolderName: seedersFolder, customSeederTemplateFilename: customSeederTemplate } = this.config;

		const generatorConfig = { seedersFolder };

		if (customSeederTemplate) {
			generatorConfig.customSeederTemplate = customSeederTemplate;
		}

		return generatorConfig;
	}

	_initConfig({ seedersFolder, customSeederTemplate }) {
		this.config = {
			userPackageJsonPath: path.join(config.projectRoot, "./package.json"),
			customSeederTemplateFilename: customSeederTemplate && customSeederTemplate,
			customSeederTemplatePath: customSeederTemplate && path.join(config.projectRoot, customSeederTemplate),
			userSeedersFolderName: seedersFolder,
			userSeedersFolderPath: path.join(config.projectRoot, seedersFolder),
			userConfigExists: config.userConfigExists,
			userConfigFilename: config.userConfigFilename,
			userConfigFilepath: config.userConfigFilepath,
			configTemplatePath: config.configTemplate,
		};
	}

	_initMemFs() {
		const store = memFs.create();
		this._memFsEditor = editor.create(store);
	}

	async _install() {
		const { START, SUCCESS, ERROR } = Installer.operations;

		try {
			this._subject.next({ type: START });

			await this._createCustomSeederTemplate();
			await this._writeUserGeneratorConfigToPackageJson();
			await this._createSeedersFolder();
			await this._writeUserConfig();

			this._subject.next({ type: SUCCESS });

			this._subject.complete();
		} catch (error) {
			const { type = ERROR, payload = { error } } = error;

			this._subject.error({ type, payload });
		}
	}

	async _commitMemFsChanges() {
		return new Promise((resolve) => {
			this._memFsEditor.commit(() => {
				resolve();
			});
		});
	}

	async _createCustomSeederTemplate() {
		const {
			CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_START,
			CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SUCCESS,
			CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_ERROR,
			CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_FILE_EXISTS,
			CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_NO_CUSTOM,
		} = Installer.operations;

		const { customSeederTemplateFilename, customSeederTemplatePath } = this.config;

		const payload = { customSeederTemplateFilename, customSeederTemplatePath };

		const notify = (type) => this._subject.next({ type, payload });

		try {
			notify(CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_START);

			if (!customSeederTemplatePath) {
				return notify(CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_NO_CUSTOM);
			}

			if (fs.existsSync(customSeederTemplatePath)) {
				notify(CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SKIP_FILE_EXISTS);
			} else {
				// copy template
				this._memFsEditor.copy(systemSeederTemplate, customSeederTemplatePath);
				// commit changes
				await this._commitMemFsChanges();

				notify(CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_SUCCESS);
			}
		} catch (error) {
			throw new InstallerError({
				type: CREATE_CUSTOM_SEEDER_TEMPLATE_FILE_ERROR,
				payload,
				error,
			});
		}
	}

	async _writeUserGeneratorConfigToPackageJson() {
		const { WRITE_USER_GENERETOR_CONFIG_START, WRITE_USER_GENERETOR_CONFIG_SUCCESS, WRITE_USER_GENERETOR_CONFIG_ERROR } = Installer.operations;

		const { userPackageJsonPath: packageJsonPath } = this.config;

		const payload = { packageJsonPath };

		try {
			this._subject.next({ type: WRITE_USER_GENERETOR_CONFIG_START, payload });

			const packageJson = require(packageJsonPath);
			packageJson.mongooseSeeders = this.getGeneratorConfig();

			this._memFsEditor.writeJSON(packageJsonPath, packageJson);

			await this._commitMemFsChanges();

			this._subject.next({
				type: WRITE_USER_GENERETOR_CONFIG_SUCCESS,
				payload,
			});
		} catch (error) {
			throw new InstallerError({
				type: WRITE_USER_GENERETOR_CONFIG_ERROR,
				payload,
				error,
			});
		}
	}

	async _createSeedersFolder() {
		const { CREATE_SEEDERS_FOLDER_START, CREATE_SEEDERS_FOLDER_SUCCESS, CREATE_SEEDERS_FOLDER_ERROR, CREATE_SEEDERS_FOLDER_SKIP_FOLDER_EXISTS } =
			Installer.operations;

		const { userSeedersFolderPath: folderpath, userSeedersFolderName: foldername } = this.config;

		const payload = { folderpath, foldername };

		try {
			this._subject.next({ type: CREATE_SEEDERS_FOLDER_START, payload });

			if (fs.existsSync(folderpath)) {
				this._subject.next({
					type: CREATE_SEEDERS_FOLDER_SKIP_FOLDER_EXISTS,
					payload,
				});
			} else {
				fs.mkdirSync(folderpath);

				this._subject.next({ type: CREATE_SEEDERS_FOLDER_SUCCESS, payload });
			}
		} catch (error) {
			throw new InstallerError({
				type: CREATE_SEEDERS_FOLDER_ERROR,
				payload,
				error,
			});
		}
	}

	async _writeUserConfig() {
		const { WRITE_USER_CONFIG_START, WRITE_USER_CONFIG_SUCCESS, WRITE_USER_CONFIG_ERROR, WRITE_USER_CONFIG_SKIP_FILE_EXISTS } = Installer.operations;

		const { userConfigExists: fileExists, userConfigFilename: filename, userConfigFilepath: filepath, configTemplatePath } = this.config;

		const payload = { fileExists, filename, filepath };

		try {
			this._subject.next({ type: WRITE_USER_CONFIG_START, payload });

			if (fileExists === true) {
				this._subject.next({
					type: WRITE_USER_CONFIG_SKIP_FILE_EXISTS,
					payload,
				});
			} else {
				// copy template
				this._memFsEditor.copy(configTemplatePath, filepath);
				// commit changes
				await this._commitMemFsChanges();

				this._subject.next({ type: WRITE_USER_CONFIG_SUCCESS, payload });
			}
		} catch (error) {
			throw new InstallerError({
				type: WRITE_USER_CONFIG_ERROR,
				payload,
				error,
			});
		}
	}
}
