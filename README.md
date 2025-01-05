# Visualizer
Music visualizer.  

## Guide
Upload any song to visualize it.  
This system allows users to create and attach custom visualizations for various purposes, such as audio-reactive animations, graphical effects, and more.

Custom visualizations can be implemented by extending the base `Visualizer.Visualiztion` class. The visualization lifecycle includes the `resize` and `update` methods, which should be overridden to define specific behavior. After implementation, the custom visualization must be attached using the `Visualizer.attach` method.

Below is an example of a custom visualization:

```js
//#region Custom visualization
Visualizer.attach(`Custom visualization`, new class extends Visualizer.Visualiztion {
	/**
	 * Invoked when the visualization context is resized.
	 * Actions for handling resizing logic should be defined here.
	 * @returns {void}
	 */
	resize() {
		const { context } = this;
		// Actions after context resize
	}

	/**
	 * Invoked during each frame update.
	 * Use this method to implement frame-by-frame behavior, such as animations or audio-driven effects.
	 * @returns {void}
	 */
	update() {
		const { context, audio, delta } = this;
		// Actions after frame update
	}
});
```
### Steps to Create Custom Visualization:
1. Extend the `Visualizer.Visualiztion` Class
   - Override the `resize` and `update` methods to define behavior.
   - Utilize `this.context`, `this.audio`, and `this.delta` for drawing, audio analysis, and frame timing.
2. Attach the Visualization
   - Use the `Visualizer.attach(name, instance)` method to integrate your visualization into the system.
   - Replace `name` with the name of your visualization.

This modular system ensures flexibility and simplicity when building custom visualizations.

## Feed
### 2.2.2 : Adaptive Core 3.3.2 (05.01.2025)
- Core updated.
- Bug fixes and program structure improvements.
- The program now prevents saving corrupted data.

### 2.2.0 : Adaptive Core 3.1.6 (03.11.2024)
- Core updated.
- Application icon changed.
- Interface improved: adapted for multiple actions, enhanced user interaction, and optimized for mobile devices.
- Added configurator, accessible via the interface or <kbd>Tab</kbd>.
- Visualization saves enabled, along with individual configuration saves for each visualization.

### 2.0.0 - UI Release : AWT 2.4.1 (17.01.2024)
- Updated the interface layout. It's now more flexible and stable.
- Improved the playback progress bar for easier use.
- The time counter no longer overlaps or blocks the playback progress bar.
- The playback progress bar now displays the time during scrolling.
- Fixed media insertion animations. They now appear sequentially, interacting with the environment.
- Media extraction no longer requires page reloading.
- Accelerated and optimized the interface.
- New experimental visualization "Pulsar". Old ones will be removed.
- Significant work on optimizing the core and the program itself. The program now consumes 23% fewer resources.

### 1.6.5 (14.12.2023)
- Updated the core (to version 2.3.4).
- Optimized the "Waveform" mode.

### 1.6.4 (06.10.2023)
- Now the uploaded song will be saved until it is removed manually.

### 1.6.3 (27.09.2023)
- Added a feature to display the author and title of the composition.
- Added corresponding configuration in the settings.

### 1.6.2 (26.09.2023)
- Settings have been sorted.
- Added smoothness and limiters settings.
- Added an anchor setting for the "Spectrogram" visualization.
- Now configuring settings are saved separately for each visualization.
- Added an enhanced shake effect for the "Spectrogram" visualization.
- The quality processing algorithm has been changed.

### 1.5.13 (24.09.2023)
- Stabilized visualizations.
- And some optimization.

### 1.5.12 (19.09.2023)
- Updated the core.
- Fixed the timer.
- Fixed music uploading.

### 1.5.10 (01.09.2023)
- Updated the core.
- Fixed an issue where fullscreen mode wasn't displaying in the button.

### 1.5.9 (26.08.2023)
- Core updated.

### 1.5.8 (26.08.2023)
- Added smoothing effect to "Waveform" visualization.
- Fixed minor errors.

### 1.5.7 (24.08.2023)
- Bug fixes.

### 1.5.6 (23.08.2023)
- Core modified.
- Code adapted for IOS devices.
- Replaced the function of automatic fullscreen mode with automatic playback due to unstable functionality.
- Added a loading panel.
- Program structure rebuilt.
- Improved metadata.
- Enhanced "Spectrogram" visualization.
- Revamped popup window styles.

### 1.4.17 (12.08.2023)
- Metadata has been modified.
- Now it's possible to upload audio and video.
- Modules have been updated.
- "Waveform" visualization has been improved.

### 1.4.15 (12.07.2023)
- Added descriptions for visualization types in the settings.
- Fixed an issue where the "Waveform" visualization was displayed incorrectly in the light theme.

### 1.4.14 (08.07.2023)
- Fixed an issue where the auto-fullscreen toggle did not respond after restoring factory settings.
- Fixed an issue where the sound wave in the "Waveform" visualization was distorted.

### 1.4.13 (07.07.2023)
- Improved visualization of the "Waveform".
- Added dynamic effects and shadows to the "Waveform" visualization.

### 1.4.12 (06.07.2023)
- Optimization of the "Spectrogram" visualization.
- Improved rendering of the "Spectrogram".

### 1.4.11 (21.06.2023)
- Added audio control slider.
- Improved internal modules.

### 1.4.9 (18.06.2023)
- Improved internal audio player.
- Added automatic fullscreen mode activation setting.
- Enhanced "Waveform" visualization.

### 1.4.8 (16.06.2023)
- Added fullscreen mode functionality.
- Fixed fullscreen mode issue.

### 1.4.7 (15.06.2023)
- Removed unnecessary settings
- Fixed settings freezing bug.
- Added time indicator.
- Improved animation module.
- Fixed internal engine errors.
- Enhanced time representation.
- Fixed line width issue in visualization "Waveform".
- Improved visualization.
- Added dynamic effects.
- Optimized visualization for high-quality processing. Now even at high qualities, the load will be approximately the same.
- Changed internal structure. Added main controlling element `Visualizer`.
- Added amplitude processing.
- Improved interface layout.
- Configured new engine stylization.
- Optimized internal modules.
- Separated local styles.

### 1.3.6 (09.05.2023)
- Modified interface.
- Added the ability to reload media files.
- Improved visualization.
- Added dynamic illumination.
- Added motion effect.
- Changed visualization mode "Waveform".
- Improved design.
- Enhanced adaptability.

### 1.2.8 (08.03.2023)
- Optimized color handling.
- Removed highlighting setting.
- Added background lighting.
- Improved visual representation.

### 1.2.6 (02.03.2023)
- Improved HTML structure of settings.
- Added highlighting setting.
- Added visualization reflection setting.
- Modified visual representation.

### 1.2.4 (28.02.2023)
- Improved compatibility of settings and their management.
- Enhanced settings descriptions.
- Added the ability to loop a song.
- Fixed modules.
- Improved JS structure.
- Prepared scripts for future updates.
- Optimized visualization.
- Added dynamic effects during pause.
- Improved layout of the "Back" icon in settings.

### 1.1.8 (25.02.2023)
- Added settings.
- Added dynamic page icons.
- Optimized the program.
- Improved HTML structure.

### 1.1.0 (23.02.2023)
- Added dynamic effects.
- Improved structural scripts.
- Optimized visualization rendering.
