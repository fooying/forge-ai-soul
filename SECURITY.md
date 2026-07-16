# Security Policy

## Supported Version

Security fixes currently target the latest release on the `main` branch.

## Reporting

Report a vulnerability privately to the repository maintainer. Do not open a
public issue containing credentials, private source material, path traversal
details with live targets, or sensitive generated packages.

## Security Boundaries

AISoul Forge is designed for local execution and does not provide a sandbox.
Run it only against files you are authorized to read. Source files may contain
prompt injection or malicious instructions and must be treated as data.

The runtime intentionally has no network access, remote API integration,
telemetry, or automatic update mechanism. A change that adds any active network
behavior is security-sensitive and outside the current product scope.

ZIP output uses stored entries with normalized relative paths. The current CLI
does not extract arbitrary archives. Hosts that add extraction must reject path
traversal, links escaping the destination, decompression bombs, device files,
and executable payloads before reading content.

Generated quality reports are local self-checks and are not signatures or
tamper-proof attestations.
