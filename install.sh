#!/bin/sh
# install.sh — fetch a prebuilt propfix binary from GitHub Releases.
#
# POSIX sh, no bashisms, so it runs under dash/ash/sh as well as bash/zsh.
#
#   curl -fsSL https://raw.githubusercontent.com/vul-os/propfix/main/install.sh | sh
#
# HONESTY NOTE (matches wede's install.sh): this script performs NO CHECKSUM
# VERIFICATION of the downloaded binary. It trusts GitHub Releases and TLS and
# nothing else. If you want a stronger guarantee, download and read the script
# first, and verify the binary against the checksums on the release page
# yourself:
#
#   curl -fsSLO https://raw.githubusercontent.com/vul-os/propfix/main/install.sh
#   less install.sh          # review before running
#   sh install.sh
#
# Also note: as of this writing propfix has no tagged release yet (see
# CHANGELOG.md — the rebuild is in progress), so `releases/latest` will 404
# until the first release is cut. This script is otherwise complete and will
# work unmodified once one exists.
set -e

REPO="vul-os/propfix"
BINARY="propfix"

echo "Installing propfix..."
echo ""

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required but not installed." >&2
  echo "  Install it with your package manager:" >&2
  echo "    Ubuntu/Debian: sudo apt install curl" >&2
  echo "    macOS:         brew install curl" >&2
  echo "    Fedora:        sudo dnf install curl" >&2
  exit 1
fi

# Detect OS and set install directory.
OS="$(uname -s)"
case "$OS" in
  Linux*)
    OS="linux"
    INSTALL_DIR="${HOME}/.local/bin"
    ;;
  Darwin*)
    OS="darwin"
    INSTALL_DIR="${HOME}/.local/bin"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    OS="windows"
    INSTALL_DIR="${LOCALAPPDATA:-$HOME/AppData/Local}/propfix"
    ;;
  *)
    echo "Error: Unsupported operating system: $OS" >&2
    exit 1
    ;;
esac

# Detect and normalise architecture to amd64/arm64.
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64)   ARCH="amd64" ;;
  aarch64|arm64)  ARCH="arm64" ;;
  *)
    echo "Error: Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

echo "  OS:   $OS"
echo "  Arch: $ARCH"
echo ""

# Get the latest release tag.
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

if [ -z "$LATEST" ]; then
  echo "Error: could not determine the latest release." >&2
  echo "  propfix may not have a tagged release yet — check" >&2
  echo "  https://github.com/${REPO}/releases" >&2
  exit 1
fi

echo "  Version: $LATEST"

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST}/${BINARY}-${OS}-${ARCH}"
if [ "$OS" = "windows" ]; then
  DOWNLOAD_URL="${DOWNLOAD_URL}.exe"
fi

echo "  Downloading from: $DOWNLOAD_URL"
echo ""

TMP_DIR=$(mktemp -d)
TMP_FILE="${TMP_DIR}/${BINARY}"
trap 'rm -rf "$TMP_DIR"' EXIT

curl -fsSL -o "$TMP_FILE" "$DOWNLOAD_URL"
chmod +x "$TMP_FILE"

mkdir -p "$INSTALL_DIR"
mv "$TMP_FILE" "${INSTALL_DIR}/${BINARY}"
echo "  Installed to ${INSTALL_DIR}/${BINARY}"

# Check if the install dir is on PATH.
case ":$PATH:" in
  *":${INSTALL_DIR}:"*) ;;
  *)
    echo ""
    echo "  Warning: ${INSTALL_DIR} is not in your PATH."
    echo "  Run this to add it:"
    echo ""
    case "$OS" in
      darwin)
        echo "    echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
        ;;
      linux)
        echo "    echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
        ;;
      windows)
        echo "    setx PATH \"%PATH%;${INSTALL_DIR}\""
        ;;
    esac
    ;;
esac

echo ""
echo "  Done! Run 'propfix --demo' to try it with seeded data, or 'propfix'"
echo "  for a real node (writes ./propfix.db in the current directory)."
echo ""
echo "  Quick start:"
echo "    propfix --demo"
echo "    open http://localhost:8099"
echo ""
