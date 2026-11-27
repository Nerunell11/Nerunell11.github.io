# Ask Codex for a review (or a read-only question) - standard wrapper around `codex exec`.
# Codex never edits the tree here: Claude designs and implements, Codex reviews (see CLAUDE.md).
# Review:   ./scripts/codex-task.ps1 -Review -PromptFile out/codex/prompts/x.md -OutFile out/codex/x.md -LogFile out/codex/logs/x.codex.log
# Question: ./scripts/codex-task.ps1 -PromptFile out/codex/prompts/q.md -OutFile out/codex/q.md -LogFile out/codex/logs/q.codex.log
# NOTE: keep this file ASCII-only. PowerShell 5.1 misparses BOM-less UTF-8 with non-ASCII chars.
# CmdletBinding makes unknown parameters (e.g. the retired -Sandbox) an error instead of ignoring them.
[CmdletBinding()]
param(
    # Inline prompt. Japanese text gets mangled by PS 5.1 quoting / stdin; prefer -PromptFile for it.
    [string]$Prompt = '',
    # UTF-8 prompt file (Japanese OK). A BOM is added if missing (Codex's PS 5.1 Get-Content
    # needs it), and Codex is told to read the file, so no non-ASCII text crosses argv or stdin.
    # With -Review it holds the intent of the change (optional); otherwise it is the question.
    [string]$PromptFile = '',
    # Run `codex exec review` on a diff instead of a free-form prompt.
    [switch]$Review,
    # -Review: ref to diff against. The remote-tracking ref, because a local 'main' is often
    # stale in a worktree and would pull already-merged changes into the review. Fetch first.
    [string]$Base = 'origin/main',
    [switch]$Uncommitted,     # -Review: review staged + unstaged + untracked changes instead of -Base
    [string]$Model = '',      # empty = Codex default model (~/.codex/config.toml)
    # Reasoning effort override. Empty = config default. Use 'high' only for changes to the
    # content schema, shared layout or build config. (The old -Profile / -Sandbox switches were
    # removed together with Codex-as-implementer, 2026-11.)
    [ValidateSet('', 'minimal', 'low', 'medium', 'high')]
    [string]$Effort = '',
    [string]$OutFile = '',    # file to write Codex's final message to
    # Send Codex's progress transcript here instead of stdout. The transcript is large; when the
    # caller is an agent, printing it puts it into the caller's context for every later turn.
    [string]$LogFile = '',
    [string]$WorkDir = ''     # empty = repository root
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (-not $WorkDir) { $WorkDir = $root }

function Resolve-RepoPath([string]$path) {
    if ([System.IO.Path]::IsPathRooted($path)) { return $path }
    return Join-Path $root $path
}

function Ensure-ParentDir([string]$path) {
    $dir = Split-Path $path -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
}

if ($PromptFile) {
    if ($Prompt) { throw 'Pass either -Prompt or -PromptFile, not both.' }
    $full = Resolve-RepoPath $PromptFile
    if (-not (Test-Path $full)) { throw "Prompt file not found: $full" }
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
    if (-not $hasBom) {
        $text = [System.IO.File]::ReadAllText($full, (New-Object System.Text.UTF8Encoding $false))
        [System.IO.File]::WriteAllText($full, $text, (New-Object System.Text.UTF8Encoding $true))
    }
    # Hand Codex the resolved path: a relative one would be read against -WorkDir, which may be
    # another worktree than the one the file was checked in.
    $rel = $full -replace '\\', '/'
    if ($Review) {
        # `codex exec review` rejects --base / --uncommitted together with a prompt, so when the
        # caller supplies the intent, the diff target has to be named in the prompt instead.
        if ($Uncommitted) { $target = 'the uncommitted changes in the working tree (staged, unstaged and untracked files)' }
        # Same range as `review --base`: merge base up to the working tree, uncommitted work included.
        else { $target = "the changes since the merge base with the base branch '$Base', including uncommitted and untracked files (find it with: git merge-base $Base HEAD; then git diff <that commit>)" }
        $Prompt = "Review $target. Read the file $rel (UTF-8, Japanese) first: it states the intent of the change. Follow the review rules in AGENTS.md."
    } else {
        $Prompt = "Read the file $rel (UTF-8, Japanese) and follow ALL instructions in it."
    }
}
if ($Review -and $Prompt -and -not $PromptFile) { throw 'With -Review, pass the intent via -PromptFile (or nothing).' }
if ($Review -and -not $Prompt -and -not $Uncommitted) {
    # Not `review --base`: the range is spelled out so that it is the same with and without an
    # intent file, and always covers committed + uncommitted work.
    $Prompt = "Review the changes since the merge base with the base branch '$Base', including uncommitted and untracked files (find it with: git merge-base $Base HEAD; then git diff <that commit>). Follow the review rules in AGENTS.md."
}
if (-not $Prompt -and -not $Review) { throw 'Pass -Prompt or -PromptFile.' }

$outFull = ''
if ($OutFile) {
    # Resolved once and used for mkdir, `-o` and the check below (-WorkDir may be another tree).
    $outFull = Resolve-RepoPath $OutFile
    Ensure-ParentDir $outFull
    # A report left by an earlier run must not be mistaken for this run's result.
    if (Test-Path $outFull) { Remove-Item -LiteralPath $outFull -Force }
}

# Always read-only: on Windows this codex build has no working 'workspace-write' sandbox, and the
# write path ('danger-full-access') was retired together with Codex-as-implementer (2026-11).
$codexArgs = @('exec', '-s', 'read-only', '--color', 'never', '-C', $WorkDir)
if ($Model)   { $codexArgs += @('-m', $Model) }
if ($Effort)  { $codexArgs += @('-c', "model_reasoning_effort=$Effort") }
if ($Review) {
    $codexArgs += 'review'
    if (-not $Prompt) { $codexArgs += '--uncommitted' }
}
if ($OutFile) { $codexArgs += @('-o', $outFull) }
# '-' = read the instructions from stdin. Passing them as an argv element is unreliable in
# PowerShell 5.1: embedded quotes and backslash sequences get mangled by native quoting.
# Without a prompt (plain review) an empty string is still piped so codex never waits on stdin.
if ($Prompt) { $codexArgs += '-' }

$OutputEncoding = New-Object System.Text.UTF8Encoding $false
if (-not $LogFile) {
    $Prompt | & codex @codexArgs
    exit $LASTEXITCODE
}

$logFull = Resolve-RepoPath $LogFile
Ensure-ParentDir $logFull
# Native stderr lines arrive as ErrorRecords in PS 5.1; they must not abort the run.
$ErrorActionPreference = 'Continue'
$Prompt | & codex @codexArgs 2>&1 | ForEach-Object { "$_" } | Out-File -FilePath $logFull -Encoding utf8
$code = $LASTEXITCODE
Write-Output "CODEX exit $code. Log: $LogFile"
if ($OutFile) {
    if ((Test-Path $outFull) -and (Get-Item $outFull).Length -gt 0) { Write-Output "Report: $OutFile" }
    else {
        Write-Output "Report missing or empty. Log tail:"
        Get-Content $logFull -Tail 30
    }
}
exit $code
