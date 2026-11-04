# Delegate a task to a Codex worker - standard wrapper around `codex exec`.
# Example: ./scripts/codex-task.ps1 -Prompt "..." -OutFile out/codex/task1.md
# NOTE: keep this file ASCII-only. PowerShell 5.1 misparses BOM-less UTF-8 with non-ASCII chars.
param(
    [string]$Prompt = '',
    # Read the prompt from a file instead (UTF-8). Used by the codex-runner agent.
    [string]$PromptFile = '',
    # Codex profile in ~/.codex (light / impl / deep). Sets model and effort together.
    [ValidateSet('', 'light', 'impl', 'deep')]
    [string]$Profile = '',
    # NOTE: on Windows this codex build silently downgrades 'workspace-write' to
    # read-only (native sandboxing was removed), so the user opted to run write
    # tasks with 'danger-full-access' (2026-07-03). Scope tasks tightly and review
    # the diff after. Use 'read-only' for analysis-only tasks.
    [ValidateSet('read-only', 'workspace-write', 'danger-full-access')]
    [string]$Sandbox = 'danger-full-access',
    [string]$Model = '',      # empty = Codex default model
    # Reasoning effort. 'low' is enough for mechanical edits with exact paths; reserve 'high' for
    # design-heavy tasks. Empty = ~/.codex/config.toml default.
    [ValidateSet('', 'minimal', 'low', 'medium', 'high')]
    [string]$Effort = '',
    [string]$OutFile = '',    # file to write Codex's final message to
    [string]$WorkDir = '',    # empty = repository root
    # Allow running in a directory that is not a git repository (e.g. a Unity project).
    # Use together with -Sandbox read-only.
    [switch]$SkipGitCheck
)

$ErrorActionPreference = 'Stop'
if ($PromptFile) { $Prompt = [System.IO.File]::ReadAllText((Resolve-Path $PromptFile), [System.Text.Encoding]::UTF8) }
if (-not $Prompt) { throw 'Specify -Prompt or -PromptFile.' }
$root = Split-Path $PSScriptRoot -Parent
if (-not $WorkDir) { $WorkDir = $root }

if ($OutFile) {
    $outDir = Split-Path $OutFile -Parent
    if ($outDir -and -not (Test-Path $outDir)) {
        New-Item -ItemType Directory -Force $outDir | Out-Null
    }
}

$codexArgs = @('exec', '-s', $Sandbox, '--color', 'never', '-C', $WorkDir)
if ($Profile) { $codexArgs += @('-p', $Profile) }
if ($Model)   { $codexArgs += @('-m', $Model) }
if ($Effort)  { $codexArgs += @('-c', "model_reasoning_effort=$Effort") }
if ($OutFile) { $codexArgs += @('-o', $OutFile) }
if ($SkipGitCheck) { $codexArgs += '--skip-git-repo-check' }

# Pass the prompt via stdin (codex reads instructions from stdin when no PROMPT
# argument is given). Passing it as an argv element is unreliable in PowerShell 5.1:
# embedded quotes and backslash sequences get mangled by native command-line quoting.
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
$Prompt | & codex @codexArgs
exit $LASTEXITCODE
