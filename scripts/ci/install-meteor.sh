#!/bin/sh

PREFIX="/usr/local"

set -e
set -u
set -x

# Let's display everything on stderr.
exec 1>&2

INSTALL=true

trap "echo Installation failed." EXIT

if [ -e "$HOME/.meteor" ]; then
  if [ "$#" -ge "1" ] && [ "$1" = "--cache" -o "$1" = "-c" ]; then
    # Just symlink meteor exe
    METEOR_SYMLINK_TARGET="$(readlink "$HOME/.meteor/meteor")"
    METEOR_TOOL_DIRECTORY="$(dirname "$METEOR_SYMLINK_TARGET")"
    LAUNCHER="$HOME/.meteor/$METEOR_TOOL_DIRECTORY/scripts/admin/launch-meteor"

    if cp "$LAUNCHER" "$PREFIX/bin/meteor"; then
      INSTALL=false
    elif type sudo >/dev/null 2>&1; then
      if [ ! -d "$PREFIX/bin" ] ; then
        sudo mkdir -m 755 "$PREFIX" || true
        sudo mkdir -m 755 "$PREFIX/bin" || true
      fi

      if sudo cp "$LAUNCHER" "$PREFIX/bin/meteor"; then
        INSTALL=false
      fi
    fi
  fi
fi

if [ "$INSTALL" = "true" ]; then
  curl https://install.meteor.com | /bin/sh
fi
