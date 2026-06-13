#!/usr/bin/env bash
set -uo pipefail
shopt -s nullglob globstar

MERMAID_IMAGE="${MERMAID_IMAGE:-minlag/mermaid-cli@sha256:1d7f446732299cd13fe574943b48be123f62626800dcfcc68ad0808dc13f183d}"
PLANTUML_IMAGE="${PLANTUML_IMAGE:-plantuml/plantuml@sha256:e0f6fb9cb28defdbcd63320c61d0e98f6cf3302039f881278db8a9cb74c6fed2}"

if ! docker pull -q "$MERMAID_IMAGE" >/dev/null; then
  echo "ERROR: failed to pull $MERMAID_IMAGE" >&2
  exit 1
fi
if ! docker pull -q "$PLANTUML_IMAGE" >/dev/null; then
  echo "ERROR: failed to pull $PLANTUML_IMAGE" >&2
  exit 1
fi

rendered=()
failed=()
skipped=()
found=0

is_empty_source() {
  [[ ! -s "$1" ]] && return 0
  ! grep -q '[^[:space:]]' "$1"
}

render_mermaid() {
  local src="$1"
  local out="${src%.mmd}.png"
  if is_empty_source "$src"; then
    echo "→ skip (empty): $src"
    skipped+=("$src")
    return 0
  fi
  echo "→ mermaid: $src"
  if docker run --rm \
      -u "$(id -u):$(id -g)" \
      -v "$PWD:/data" \
      "$MERMAID_IMAGE" \
      -i "/data/$src" \
      -o "/data/$out" \
      -b white \
      --width 2400 \
      --scale 4; then
    rendered+=("$out")
  else
    echo "  FAIL: $src" >&2
    failed+=("$src")
  fi
}

render_plantuml() {
  local src="$1"
  local out="${src%.puml}.png"
  if is_empty_source "$src"; then
    echo "→ skip (empty): $src"
    skipped+=("$src")
    return 0
  fi
  echo "→ plantuml: $src"
  if docker run --rm \
      -u "$(id -u):$(id -g)" \
      -e PLANTUML_LIMIT_SIZE=16384 \
      -v "$PWD:/data" \
      "$PLANTUML_IMAGE" \
      -tpng \
      -Sdpi=300 \
      "/data/$src"; then
    rendered+=("$out")
  else
    echo "  FAIL: $src" >&2
    failed+=("$src")
  fi
}

for src in **/*.mmd; do
  [[ "$src" == node_modules/* ]] && continue
  [[ "$src" == *_Viejo/* ]] && continue   # deprecados, fuera de la entrega
  found=1
  render_mermaid "$src"
done

for src in **/*.puml; do
  [[ "$src" == node_modules/* ]] && continue
  [[ "$src" == *_Viejo/* ]] && continue   # deprecados, fuera de la entrega
  found=1
  render_plantuml "$src"
done

if [[ "$found" -eq 0 ]]; then
  echo "No diagram files found"
  exit 0
fi

if [[ "${#rendered[@]}" -gt 0 ]]; then
  if command -v oxipng >/dev/null 2>&1; then
    echo ""
    echo "Optimizing ${#rendered[@]} PNG(s) with oxipng…"
    oxipng -o 2 --strip safe -- "${rendered[@]}" || echo "  (oxipng returned non-zero, continuing)"
  else
    echo ""
    echo "oxipng not installed, skipping optimization"
  fi
fi

echo ""
echo "=== Summary ==="
echo "Rendered: ${#rendered[@]}"
echo "Skipped:  ${#skipped[@]}"
echo "Failed:   ${#failed[@]}"
if [[ "${#skipped[@]}" -gt 0 ]]; then
  printf '  ~ %s\n' "${skipped[@]}"
fi
if [[ "${#failed[@]}" -gt 0 ]]; then
  printf '  - %s\n' "${failed[@]}" >&2
  exit 1
fi
