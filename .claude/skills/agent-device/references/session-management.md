# Session Management

## Named sessions

```bash
agent-device --session auth open Settings --platform ios
agent-device --session auth snapshot -i
```

Sessions isolate device context. A device can only be held by one session at a time.

## Best practices

- Name sessions semantically.
- Close sessions when done.
- Use separate sessions for parallel work.
- For remote tenant-scoped automation, run commands with:
  `--tenant <id> --session-isolation tenant --run-id <id> --lease-id <id>`
- In iOS sessions, use `open <app>`. `open <url>` opens deep links; on devices `http(s)://` opens Safari when no app is active, and custom schemes require an active app in the session.
- In iOS sessions, `open <app> <url>` opens a deep link.
- On iOS, `appstate` is session-scoped and requires a matching active session on the target device.
- For dev loops where runtime state can persist (for example React Native Fast Refresh), use `open <app> --relaunch` to restart the app process in the same session.
- Use `--save-script [path]` to record replay scripts on `close`; path is a file path and parent directories are created automatically.
- For ambiguous bare `--save-script` values, prefer `--save-script=workflow.ad` or `./workflow.ad`.
- For deterministic replay scripts, prefer selector-based actions and assertions.
- Use `replay -u` to update selector drift during maintenance.

## Listing sessions

```bash
agent-device session list
```

## Replay within sessions

```bash
agent-device replay ./session.ad --session auth
agent-device replay -u ./session.ad --session auth
```

## Tenant isolation note

When session isolation is set to tenant mode, session namespace is scoped as
`<tenant>:<session>`. For remote runs, allocate and maintain an active lease
for the same tenant/run scope before executing tenant-isolated commands.
