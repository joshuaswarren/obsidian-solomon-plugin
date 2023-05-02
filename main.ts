// main.ts

import { Plugin, TFile, TAbstractFile, App, PluginSettingTab, Setting } from 'obsidian';
import { fetchAndSummarizeNoFiles } from 'podcast-takeaways';

interface SolomonSettings {
	openAiApiKey: string;
	summarizationModel: string;
	answerModel: string;
	ffmpegPath: string;
	folderPath: string;
	filePathTemplate: string;
	personalInfo: string;
	podcastUrls: string[];
	updateFrequency: number;
}

const DEFAULT_SETTINGS: SolomonSettings = {
	openAiApiKey: '',
	summarizationModel: 'gpt-3.5-turbo',
	answerModel: 'gpt-3.5-turbo',
	ffmpegPath: '',
	folderPath: '',
	filePathTemplate: 'YYYY-MM-DD',
	personalInfo: '',
	podcastUrls: [],
	updateFrequency: 1440, // 1440 minutes = 1 day
};

export default class SolomonPlugin extends Plugin {
	settings: SolomonSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SolomonSettingTab(this.app, this));

		this.registerInterval(
			window.setInterval(() => this.fetchAndAppendTakeaways(), this.settings.updateFrequency * 60 * 1000)
		);
		this.addCommand({
			id: "fetch-and-append-takeaways",
			name: "Fetch and append takeaways",
			callback: async () => {
				await this.fetchAndAppendTakeaways();
			},
		});
	}

	async fetchAndAppendTakeaways() {
		for (const url of this.settings.podcastUrls) {
			const takeaway = await fetchAndSummarizeNoFiles(
				this.settings.openAiApiKey,
				this.settings.personalInfo,
				url,
				this.settings.ffmpegPath
			);

			const filePath = this.settings.folderPath + '/' + this.settings.filePathTemplate + '.md';
			const existingFile = this.app.vault.getAbstractFileByPath(filePath) as TFile;

			if (existingFile) {
				const existingContent = await this.app.vault.read(existingFile);
				await this.app.vault.modify(existingFile, existingContent + '\n' + takeaway);
			} else {
				await this.app.vault.create(filePath, takeaway);
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SolomonSettingTab extends PluginSettingTab {
	plugin: SolomonPlugin;

	constructor(app: App, plugin: SolomonPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Solomon Plugin Settings' });

		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('Enter your OpenAI API key')
			.addText(text => text
				.setPlaceholder('Enter your OpenAI API key')
				.setValue(this.plugin.settings.openAiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openAiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Folder Path')
			.setDesc('Enter the path where you want the takeaways to be stored')
			.addText(text => text
				.setPlaceholder('Enter the path')
				.setValue(this.plugin.settings.folderPath)
				.onChange(async (value) => {
					this.plugin.settings.folderPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('File Path Template')
			.setDesc('Enter the file path template with placeholders for date information (e.g., YYYY-MM-DD)')
			.addText(text => text
				.setPlaceholder('Enter the file path template')
				.setValue(this.plugin.settings.filePathTemplate)
				.onChange(async (value) => {
					this.plugin.settings.filePathTemplate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Personal Information')
			.setDesc('Enter the personal information you would like GPT to personalize your takeaways for')
			.addTextArea(text => text
				.setPlaceholder('Enter your personal information')
				.setValue(this.plugin.settings.personalInfo)
				.onChange(async (value) => {
					this.plugin.settings.personalInfo = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Podcast URLs')
			.setDesc('Enter one or more podcast URLs to check for new episodes')
			.addTextArea(text => text
				.setPlaceholder('Enter podcast URLs, separated by commas')
				.setValue(this.plugin.settings.podcastUrls.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.podcastUrls = value.split(',').map(url => url.trim());
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Update Frequency')
			.setDesc('Enter the frequency to check for updates (in minutes)')
			.addSlider(slider => slider
				.setLimits(1, 1440, 1) // From 1 minute to 1440 minutes (1 day)
				.setValue(this.plugin.settings.updateFrequency)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.updateFrequency = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('FFMpeg Path')
			.setDesc('Optional: Enter the path to FFMpeg on your system')
			.addText(text => text
				.setPlaceholder('Enter the path to FFMpeg')
				.setValue(this.plugin.settings.ffmpegPath)
				.onChange(async (value) => {
					this.plugin.settings.ffmpegPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Summarization Model')
			.setDesc('Enter the OpenAI model for summarization (default: gpt-3.5-turbo)')
			.addText(text => text
				.setPlaceholder('Enter the summarization model')
				.setValue(this.plugin.settings.summarizationModel)
				.onChange(async (value) => {
					this.plugin.settings.summarizationModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Takeaways Model')
			.setDesc('Enter the OpenAI model for takeaways (default: gpt-3.5-turbo)')
			.addText(text => text
				.setPlaceholder('Enter the takeaways model')
				.setValue(this.plugin.settings.answerModel)
				.onChange(async (value) => {
					this.plugin.settings.answerModel = value;
					await this.plugin.saveSettings();
				}));
	}
}
