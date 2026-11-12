// 공용 경로·설정·pixelfx 실행 도우미
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const VENDOR = join(ROOT, "vendor", "pixelfx");
export const lock = JSON.parse(readFileSync(join(ROOT, "pixelfx.lock.json"), "utf8"));
export const config = {
  godotProject: "godot", godotFxDir: "assets/fx", sheetsDir: "art/fx",
  ...JSON.parse(readFileSync(join(ROOT, "fx.config.json"), "utf8")),
};

export const sheetsRoot = () => resolve(ROOT, config.sheetsDir);
export const godotFxRoot = () => resolve(ROOT, config.godotProject, config.godotFxDir);

export function git(args, cwd = VENDOR) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/** 고정된 커밋으로 vendor/pixelfx 를 맞춘다. 이미 맞으면 아무것도 안 한다. */
export function ensureInstalled({ quiet = false } = {}) {
  const log = (m) => { if (!quiet) console.log(m); };
  if (existsSync(join(VENDOR, ".git"))) {
    try {
      if (git(["rev-parse", "HEAD"]) === lock.commit) {
        log(`pixelfx ${lock.version} (${lock.commit.slice(0, 7)}) 확인됨`);
        return;
      }
    } catch { /* 아래에서 다시 받는다 */ }
  } else {
    mkdirSync(VENDOR, { recursive: true });
    git(["init", "-q"]);
    git(["remote", "add", "origin", lock.repo]);
  }
  log(`pixelfx ${lock.version} (${lock.commit.slice(0, 7)}) 받는 중...`);
  git(["fetch", "--depth", "1", "origin", lock.commit]);
  git(["-c", "advice.detachedHead=false", "checkout", "-q", "--force", lock.commit]);
  const got = JSON.parse(readFileSync(join(VENDOR, "package.json"), "utf8")).version;
  if (got !== lock.version) throw new Error(`버전 불일치: 기대 ${lock.version}, 실제 ${got}`);
  log("설치 완료");
}

/** vendor/pixelfx/tools/<tool>.mjs 실행. 출력은 그대로 보여 준다. */
export function runTool(tool, args) {
  ensureInstalled({ quiet: true });
  execFileSync(process.execPath, [join(VENDOR, "tools", `${tool}.mjs`), ...args], { cwd: VENDOR, stdio: "inherit" });
}

export function toolOutput(tool, args) {
  ensureInstalled({ quiet: true });
  return execFileSync(process.execPath, [join(VENDOR, "tools", `${tool}.mjs`), ...args], { cwd: VENDOR, encoding: "utf8" });
}
