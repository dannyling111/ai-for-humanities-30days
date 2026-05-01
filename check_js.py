"""State-machine JS sanity checker.

Walks data.js / app.js / cases.js / templates.js character by character through:
  code | str_dq | str_sq | tmpl | line_cmt | block_cmt
states. Flags unterminated strings, which are the main cause of "Unexpected number"
SyntaxError on Chinese-content sites.
"""
from __future__ import annotations
import io
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent
TARGETS = ["assets/js/data.js", "assets/js/app.js", "assets/js/cases.js", "assets/js/templates.js"]

DQ, SQ, BT, BS = '"', "'", "`", "\\"


def check(src: str) -> list[str]:
    state = "code"
    i = 0
    n = len(src)
    line = 1
    errors: list[str] = []
    last_significant = ""  # last non-whitespace, non-comment char (used to disambiguate / regex vs division)
    REGEX_PRECEDERS = set("=([{,;:!&|?+-*~^<>")
    # Stack for template-literal interpolation: when entering ${ inside tmpl, push "tmpl"
    # and track brace depth in code; when depth returns to 0 and we see }, pop back to tmpl.
    interp_stack: list[int] = []  # each entry = brace depth when we entered code-from-tmpl
    brace_depth = 0
    while i < n:
        c = src[i]
        if c == "\n":
            line += 1
        if state == "code":
            if c == DQ:
                state = "str_dq"
            elif c == SQ:
                state = "str_sq"
            elif c == BT:
                state = "tmpl"
            elif c == "/" and i + 1 < n and src[i + 1] == "/":
                state = "line_cmt"
                i += 1
            elif c == "/" and i + 1 < n and src[i + 1] == "*":
                state = "block_cmt"
                i += 1
            elif c == "/" and (last_significant == "" or last_significant in REGEX_PRECEDERS):
                # Probably a regex literal — skip until unescaped closing /
                state = "regex"
            elif c == "{":
                brace_depth += 1
            elif c == "}":
                if interp_stack and brace_depth == interp_stack[-1]:
                    interp_stack.pop()
                    state = "tmpl"
                else:
                    brace_depth -= 1
        elif state == "str_dq":
            if c == BS and i + 1 < n:
                i += 1
            elif c == DQ:
                state = "code"
            elif c == "\n":
                errors.append(f"L{line}: unterminated double-quoted string")
                state = "code"
        elif state == "str_sq":
            if c == BS and i + 1 < n:
                i += 1
            elif c == SQ:
                state = "code"
            elif c == "\n":
                errors.append(f"L{line}: unterminated single-quoted string")
                state = "code"
        elif state == "tmpl":
            if c == BS and i + 1 < n:
                i += 1
            elif c == BT:
                state = "code"
            elif c == "$" and i + 1 < n and src[i + 1] == "{":
                # Enter interpolation: switch to code, remember current brace depth
                interp_stack.append(brace_depth)
                state = "code"
                i += 1  # skip the {
        elif state == "line_cmt":
            if c == "\n":
                state = "code"
        elif state == "block_cmt":
            if c == "*" and i + 1 < n and src[i + 1] == "/":
                state = "code"
                i += 1
        elif state == "regex":
            if c == BS and i + 1 < n:
                i += 1
            elif c == "[":
                state = "regex_class"
            elif c == "/":
                state = "code"
                # skip flags
                while i + 1 < n and src[i + 1] in "gimsuy":
                    i += 1
        elif state == "regex_class":
            if c == BS and i + 1 < n:
                i += 1
            elif c == "]":
                state = "regex"
        if state == "code" and not c.isspace():
            last_significant = c
        i += 1
    if state != "code":
        errors.append(f"EOF reached in state={state}")
    return errors


def main() -> int:
    bad = 0
    for rel in TARGETS:
        p = ROOT / rel
        if not p.exists():
            continue
        errs = check(p.read_text(encoding="utf-8"))
        if errs:
            bad += 1
            print(f"❌ {rel}: {len(errs)} issue(s)")
            for e in errs[:5]:
                print(f"   {e}")
        else:
            print(f"✅ {rel}: OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
