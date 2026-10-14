# Third-party software

Application code is MIT licensed. Dependencies, the inference runtime and model
retain their own licences; they are downloaded separately.

| Component | Version used | Licence | Source |
| --- | --- | --- | --- |
| Qwen3 | 1.7B, Ollama Q4_K_M | Apache-2.0 | [Qwen model card](https://huggingface.co/Qwen/Qwen3-1.7B) |
| Ollama | 0.40.0 | MIT | [Licence](https://github.com/ollama/ollama/blob/v0.40.0/LICENSE) |
| Playwright | 1.63.0 | Apache-2.0 | [Licence](https://github.com/microsoft/playwright/blob/v1.63.0/LICENSE) |
| Chromium | revision 1243 | BSD and third-party licences | [Chromium notices](https://www.chromium.org/chromium-os/licensing/) |
| React / React DOM | 19.3.0 | MIT | [Licence](https://github.com/facebook/react/blob/main/LICENSE) |
| Vite | 8.3.1 | MIT | [Licence](https://github.com/vitejs/vite/blob/main/LICENSE) |
| TypeScript | 5.9.3 | Apache-2.0 | [Licence](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| Node / React type definitions | See package-lock.json | MIT | [DefinitelyTyped licence](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) |

The lockfile records transitive versions and licences. Keep upstream notices if
you redistribute installed dependencies or built bundles. Downloaded runtimes,
models and browser binaries are excluded from this repository.

Model weight SHA-256 used for the measurements:
`3d0b790534fe4b79525fc3692950408dca41171676ed7e21db57af5c65ef6ab6`
(1,359,279,776 bytes). A future pull of the same tag may differ.

All café pages and evaluation briefs are original synthetic fixtures.
No PocketPause application code was copied. Its previously downloaded runtime,
weights and browser cache were reused locally.

Prior-art inspection included
[playwright-ai-testgen](https://github.com/TinasheBA/playwright-ai-testgen)
at `bbf003c6f78ceb719de1669d1af0c53d84d5d072`; no code was copied.
The project informed the decision to measure page behavior with fixed checks
rather than equate generated test code with verified coverage.
