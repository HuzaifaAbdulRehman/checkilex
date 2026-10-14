# Local data notice

Version 0.1.0, prepared 14 October 2026. Owner approval pending.

Briefs can contain client or personal information. Use text you are authorised
to process and inspect only your own developer-controlled local pages.

The app sends the brief to Ollama at 127.0.0.1:11434. The runtime runs Qwen locally;
the launcher disables Ollama cloud features. Reviewed checks go to fixed browser
measurements. The application does not send briefs to a hosted inference API.

The app keeps its current brief, checks, screenshots and report in memory.
Clear this session or reload removes the UI state. There is no application
history database, browser-storage history, cookie system or telemetry.
Ollama may keep its local inference context until unloading; clearing the UI
does not securely erase RAM, runtime context or exported files.

Markdown and PNG downloads remain on disk until the user deletes them.
Development scripts intentionally save synthetic evaluation/demo evidence.
Package, browser and model setup downloads require internet access.

The maintainer does not receive client briefs through this application.
If reporting an issue, replace client information with a synthetic example.
The planned public support channel is GitHub issues after repository publication.
