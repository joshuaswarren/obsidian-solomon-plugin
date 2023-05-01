// main.ts
import { __awaiter } from "tslib";
import { Plugin, PluginSettingTab, Setting } from 'obsidian';
import { fetchAndSummarize } from 'podcast-takeaways';
const DEFAULT_SETTINGS = {
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
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new SolomonSettingTab(this.app, this));
            this.registerInterval(window.setInterval(() => this.fetchAndAppendTakeaways(), this.settings.updateFrequency * 60 * 1000));
        });
    }
    fetchAndAppendTakeaways() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const url of this.settings.podcastUrls) {
                const takeaway = yield fetchAndSummarize(this.settings.openAiApiKey, this.settings.personalInfo, url, this.settings.ffmpegPath);
                const filePath = this.settings.folderPath + '/' + this.settings.filePathTemplate + '.md';
                const existingFile = this.app.vault.getAbstractFileByPath(filePath);
                if (existingFile) {
                    const existingContent = yield this.app.vault.read(existingFile);
                    yield this.app.vault.modify(existingFile, existingContent + '\n' + takeaway);
                }
                else {
                    yield this.app.vault.create(filePath, takeaway);
                }
            }
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
}
class SolomonSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Solomon Plugin Settings' });
        new Setting(containerEl)
            .setName('OpenAI API Key')
            .setDesc('Enter your OpenAI API key')
            .addText(text => text
            .setPlaceholder('Enter your OpenAI API key')
            .setValue(this.plugin.settings.openAiApiKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.openAiApiKey = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Folder Path')
            .setDesc('Enter the path where you want the takeaways to be stored')
            .addText(text => text
            .setPlaceholder('Enter the path')
            .setValue(this.plugin.settings.folderPath)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.folderPath = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('File Path Template')
            .setDesc('Enter the file path template with placeholders for date information (e.g., YYYY-MM-DD)')
            .addText(text => text
            .setPlaceholder('Enter the file path template')
            .setValue(this.plugin.settings.filePathTemplate)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.filePathTemplate = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Personal Information')
            .setDesc('Enter the personal information you would like GPT to personalize your takeaways for')
            .addTextArea(text => text
            .setPlaceholder('Enter your personal information')
            .setValue(this.plugin.settings.personalInfo)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.personalInfo = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Podcast URLs')
            .setDesc('Enter one or more podcast URLs to check for new episodes')
            .addTextArea(text => text
            .setPlaceholder('Enter podcast URLs, separated by commas')
            .setValue(this.plugin.settings.podcastUrls.join(', '))
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.podcastUrls = value.split(',').map(url => url.trim());
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Update Frequency')
            .setDesc('Enter the frequency to check for updates (in minutes)')
            .addSlider(slider => slider
            .setLimits(1, 1440, 1) // From 1 minute to 1440 minutes (1 day)
            .setValue(this.plugin.settings.updateFrequency)
            .setDynamicTooltip()
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.updateFrequency = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('FFMpeg Path')
            .setDesc('Optional: Enter the path to FFMpeg on your system')
            .addText(text => text
            .setPlaceholder('Enter the path to FFMpeg')
            .setValue(this.plugin.settings.ffmpegPath)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.ffmpegPath = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Summarization Model')
            .setDesc('Enter the OpenAI model for summarization (default: gpt-3.5-turbo)')
            .addText(text => text
            .setPlaceholder('Enter the summarization model')
            .setValue(this.plugin.settings.summarizationModel)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.summarizationModel = value;
            yield this.plugin.saveSettings();
        })));
        new Setting(containerEl)
            .setName('Takeaways Model')
            .setDesc('Enter the OpenAI model for takeaways (default: gpt-3.5-turbo)')
            .addText(text => text
            .setPlaceholder('Enter the takeaways model')
            .setValue(this.plugin.settings.answerModel)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.answerModel = value;
            yield this.plugin.saveSettings();
        })));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsVUFBVTs7QUFFVixPQUFPLEVBQUUsTUFBTSxFQUE2QixnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDeEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFjdEQsTUFBTSxnQkFBZ0IsR0FBb0I7SUFDekMsWUFBWSxFQUFFLEVBQUU7SUFDaEIsa0JBQWtCLEVBQUUsZUFBZTtJQUNuQyxXQUFXLEVBQUUsZUFBZTtJQUM1QixVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxFQUFFO0lBQ2QsZ0JBQWdCLEVBQUUsWUFBWTtJQUM5QixZQUFZLEVBQUUsRUFBRTtJQUNoQixXQUFXLEVBQUUsRUFBRTtJQUNmLGVBQWUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCO0NBQzlDLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxPQUFPLGFBQWMsU0FBUSxNQUFNO0lBRzFDLE1BQU07O1lBQ1gsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsZ0JBQWdCLENBQ3BCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUNuRyxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRUssdUJBQXVCOztZQUM1QixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLGlCQUFpQixDQUN2QyxJQUFJLENB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QU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2FBQzFDLFFBQVEsQ0FBQyxDQUFPLEtBQUssRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbIi8vIG1haW4udHNcblxuaW1wb3J0IHsgUGx1Z2luLCBURmlsZSwgVEFic3RyYWN0RmlsZSwgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgZmV0Y2hBbmRTdW1tYXJpemUgfSBmcm9tICdwb2RjYXN0LXRha2Vhd2F5cyc7XG5cbmludGVyZmFjZSBTb2xvbW9uU2V0dGluZ3Mge1xuXHRvcGVuQWlBcGlLZXk6IHN0cmluZztcblx0c3VtbWFyaXphdGlvbk1vZGVsOiBzdHJpbmc7XG5cdGFuc3dlck1vZGVsOiBzdHJpbmc7XG5cdGZmbXBlZ1BhdGg6IHN0cmluZztcblx0Zm9sZGVyUGF0aDogc3RyaW5nO1xuXHRmaWxlUGF0aFRlbXBsYXRlOiBzdHJpbmc7XG5cdHBlcnNvbmFsSW5mbzogc3RyaW5nO1xuXHRwb2RjYXN0VXJsczogc3RyaW5nW107XG5cdHVwZGF0ZUZyZXF1ZW5jeTogbnVtYmVyO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBTb2xvbW9uU2V0dGluZ3MgPSB7XG5cdG9wZW5BaUFwaUtleTogJycsXG5cdHN1bW1hcml6YXRpb25Nb2RlbDogJ2dwdC0zLjUtdHVyYm8nLFxuXHRhbnN3ZXJNb2RlbDogJ2dwdC0zLjUtdHVyYm8nLFxuXHRmZm1wZWdQYXRoOiAnJyxcblx0Zm9sZGVyUGF0aDogJycsXG5cdGZpbGVQYXRoVGVtcGxhdGU6ICdZWVlZLU1NLUREJyxcblx0cGVyc29uYWxJbmZvOiAnJyxcblx0cG9kY2FzdFVybHM6IFtdLFxuXHR1cGRhdGVGcmVxdWVuY3k6IDE0NDAsIC8vIDE0NDAgbWludXRlcyA9IDEgZGF5XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2xvbW9uUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcblx0c2V0dGluZ3M6IFNvbG9tb25TZXR0aW5ncztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU29sb21vblNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdHRoaXMucmVnaXN0ZXJJbnRlcnZhbChcblx0XHRcdHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZldGNoQW5kQXBwZW5kVGFrZWF3YXlzKCksIHRoaXMuc2V0dGluZ3MudXBkYXRlRnJlcXVlbmN5ICogNjAgKiAxMDAwKVxuXHRcdCk7XG5cdH1cblxuXHRhc3luYyBmZXRjaEFuZEFwcGVuZFRha2Vhd2F5cygpIHtcblx0XHRmb3IgKGNvbnN0IHVybCBvZiB0aGlzLnNldHRpbmdzLnBvZGNhc3RVcmxzKSB7XG5cdFx0XHRjb25zdCB0YWtlYXdheSA9IGF3YWl0IGZldGNoQW5kU3VtbWFyaXplKFxuXHRcdFx0XHR0aGlzLnNldHRpbmdzLm9wZW5BaUFwaUtleSxcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy5wZXJzb25hbEluZm8sXG5cdFx0XHRcdHVybCxcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy5mZm1wZWdQYXRoXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBmaWxlUGF0aCA9IHRoaXMuc2V0dGluZ3MuZm9sZGVyUGF0aCArICcvJyArIHRoaXMuc2V0dGluZ3MuZmlsZVBhdGhUZW1wbGF0ZSArICcubWQnO1xuXHRcdFx0Y29uc3QgZXhpc3RpbmdGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVQYXRoKSBhcyBURmlsZTtcblxuXHRcdFx0aWYgKGV4aXN0aW5nRmlsZSkge1xuXHRcdFx0XHRjb25zdCBleGlzdGluZ0NvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGV4aXN0aW5nRmlsZSk7XG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShleGlzdGluZ0ZpbGUsIGV4aXN0aW5nQ29udGVudCArICdcXG4nICsgdGFrZWF3YXkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKGZpbGVQYXRoLCB0YWtlYXdheSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXHR9XG5cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdH1cbn1cblxuY2xhc3MgU29sb21vblNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBTb2xvbW9uUGx1Z2luO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFNvbG9tb25QbHVnaW4pIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGxldCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdTb2xvbW9uIFBsdWdpbiBTZXR0aW5ncycgfSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdPcGVuQUkgQVBJIEtleScpXG5cdFx0XHQuc2V0RGVzYygnRW50ZXIgeW91ciBPcGVuQUkgQVBJIGtleScpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdFbnRlciB5b3VyIE9wZW5BSSBBUEkga2V5Jylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm9wZW5BaUFwaUtleSlcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLm9wZW5BaUFwaUtleSA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdGb2xkZXIgUGF0aCcpXG5cdFx0XHQuc2V0RGVzYygnRW50ZXIgdGhlIHBhdGggd2hlcmUgeW91IHdhbnQgdGhlIHRha2Vhd2F5cyB0byBiZSBzdG9yZWQnKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRW50ZXIgdGhlIHBhdGgnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sZGVyUGF0aClcblx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmZvbGRlclBhdGggPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnRmlsZSBQYXRoIFRlbXBsYXRlJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgZmlsZSBwYXRoIHRlbXBsYXRlIHdpdGggcGxhY2Vob2xkZXJzIGZvciBkYXRlIGluZm9ybWF0aW9uIChlLmcuLCBZWVlZLU1NLUREKScpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdFbnRlciB0aGUgZmlsZSBwYXRoIHRlbXBsYXRlJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVQYXRoVGVtcGxhdGUpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlUGF0aFRlbXBsYXRlID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ1BlcnNvbmFsIEluZm9ybWF0aW9uJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgcGVyc29uYWwgaW5mb3JtYXRpb24geW91IHdvdWxkIGxpa2UgR1BUIHRvIHBlcnNvbmFsaXplIHlvdXIgdGFrZWF3YXlzIGZvcicpXG5cdFx0XHQuYWRkVGV4dEFyZWEodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRW50ZXIgeW91ciBwZXJzb25hbCBpbmZvcm1hdGlvbicpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wZXJzb25hbEluZm8pXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5wZXJzb25hbEluZm8gPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnUG9kY2FzdCBVUkxzJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciBvbmUgb3IgbW9yZSBwb2RjYXN0IFVSTHMgdG8gY2hlY2sgZm9yIG5ldyBlcGlzb2RlcycpXG5cdFx0XHQuYWRkVGV4dEFyZWEodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRW50ZXIgcG9kY2FzdCBVUkxzLCBzZXBhcmF0ZWQgYnkgY29tbWFzJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnBvZGNhc3RVcmxzLmpvaW4oJywgJykpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5wb2RjYXN0VXJscyA9IHZhbHVlLnNwbGl0KCcsJykubWFwKHVybCA9PiB1cmwudHJpbSgpKTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnVXBkYXRlIEZyZXF1ZW5jeScpXG5cdFx0XHQuc2V0RGVzYygnRW50ZXIgdGhlIGZyZXF1ZW5jeSB0byBjaGVjayBmb3IgdXBkYXRlcyAoaW4gbWludXRlcyknKVxuXHRcdFx0LmFkZFNsaWRlcihzbGlkZXIgPT4gc2xpZGVyXG5cdFx0XHRcdC5zZXRMaW1pdHMoMSwgMTQ0MCwgMSkgLy8gRnJvbSAxIG1pbnV0ZSB0byAxNDQwIG1pbnV0ZXMgKDEgZGF5KVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudXBkYXRlRnJlcXVlbmN5KVxuXHRcdFx0XHQuc2V0RHluYW1pY1Rvb2x0aXAoKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MudXBkYXRlRnJlcXVlbmN5ID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ0ZGTXBlZyBQYXRoJylcblx0XHRcdC5zZXREZXNjKCdPcHRpb25hbDogRW50ZXIgdGhlIHBhdGggdG8gRkZNcGVnIG9uIHlvdXIgc3lzdGVtJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ0VudGVyIHRoZSBwYXRoIHRvIEZGTXBlZycpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5mZm1wZWdQYXRoKVxuXHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuZmZtcGVnUGF0aCA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdTdW1tYXJpemF0aW9uIE1vZGVsJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgT3BlbkFJIG1vZGVsIGZvciBzdW1tYXJpemF0aW9uIChkZWZhdWx0OiBncHQtMy41LXR1cmJvKScpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdFbnRlciB0aGUgc3VtbWFyaXphdGlvbiBtb2RlbCcpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdW1tYXJpemF0aW9uTW9kZWwpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdW1tYXJpemF0aW9uTW9kZWwgPSB2YWx1ZTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSkpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnVGFrZWF3YXlzIE1vZGVsJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgT3BlbkFJIG1vZGVsIGZvciB0YWtlYXdheXMgKGRlZmF1bHQ6IGdwdC0zLjUtdHVyYm8pJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ0VudGVyIHRoZSB0YWtlYXdheXMgbW9kZWwnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYW5zd2VyTW9kZWwpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5hbnN3ZXJNb2RlbCA9IHZhbHVlO1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHR9KSk7XG5cdH1cbn1cbiJdfQ==