#!/bin/sh
# Enable the version-controlled git hooks for this clone.
# Run once after cloning:  sh scripts/enable-hooks.sh
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true
echo "Git hooks enabled (core.hooksPath -> .githooks)."
echo "pre-push will now block accidental deploys to sikhpn.org."
