#!/usr/bin/env node
// pixelfx 이펙트 -> 스프라이트 시트(PNG+JSON) -> Godot 가져오기.
//   node tools/fx/cli.mjs            메뉴
//   node tools/fx/cli.mjs setup      고정 버전 받기/확인
//   node tools/fx/cli.mjs search 단어...
//   node tools/fx/cli.mjs preview <id|카테고리>...   contact sheet(PNG)만 만들어 눈으로 확인
//   node tools/fx/cli.mjs sheet <id|카테고리>... [--opts '{"palette":...}'] [--seed N] [--fps N]
//   node tools/fx/cli.mjs import <id|카테고리>... [같은 옵션]   시트 + Godot 파일(.tres/.tscn)
import { createInterface } from "node:readline/promises";
import { join } from "node:path";
import { ensureInstalled, runTool, toolOutput, sheetsRoot, config, lock } from "./lib.mjs";
import { importToGodot, rel } from "./godot.mjs";

const PASS = ["opts", "seed", "fps", "bg"]; // render.mjs 로 그대로 넘기는 옵션
const ID = /^[\w-]+\/[\w-]+$/;

function parse(argv) {
  const ids = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
    else ids.push(argv[i]);
  }
  return { ids, flags };
}
const passArgs = (flags) => PASS.filter((k) => flags[k] !== undefined).flatMap((k) => [`--${k}`, flags[k]]);

/** id 는 그대로, 카테고리(예: ice)는 그 카테고리의 모든 이펙트 id 로 푼다. */
function expand(ids) {
  const out = [];
  for (const q of ids) {
    if (ID.test(q)) { out.push(q); continue; }
    const found = toolOutput("list", [q])
      .split("\n").map((l) => l.split(/\s+/)[0]).filter((s) => ID.test(s))
      .filter((s) => s.startsWith(q + "/"));
    if (!found.length) throw new Error(`이펙트/카테고리를 찾을 수 없음: ${q}`);
    out.push(...found);
  }
  return [...new Set(out)];
}

function search(words) { runTool("list", words); }

function preview(ids, flags) {
  for (const id of expand(ids)) runTool("render", [id, "--out", sheetsRoot(), ...passArgs(flags)]);
  console.log(`\ncontact.png 를 열어 확인하세요: ${rel(sheetsRoot())}/<id>/contact.png`);
}

function sheet(ids, flags) {
  for (const id of expand(ids)) runTool("render", [id, "--sheet", "--out", sheetsRoot(), ...passArgs(flags)]);
  console.log(`\n시트 위치: ${rel(sheetsRoot())}/<id>/<이름>.png + .json`);
}

function doImport(ids, flags) {
  for (const id of expand(ids)) {
    runTool("render", [id, "--sheet", "--out", sheetsRoot(), ...passArgs(flags)]);
    const r = importToGodot(join(sheetsRoot(), id), id);
    console.log(`  -> Godot: ${r.scene}  (${r.frames}프레임, ${r.fps}fps, ${r.loop ? "반복" : "1회"})`);
  }
  console.log(`\nGodot 프로젝트 "${config.godotProject}" 의 ${config.godotFxDir}/ 에 넣었습니다. 편집기를 열면 자동으로 가져옵니다.`);
}

async function menu() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (q) => {
    process.stdout.write(q);
    const { value, done } = await lines.next();
    if (done) return "0"; // 입력이 끝나면 종료
    return String(value).trim();
  };
  const idsFrom = (s) => s.split(/[\s,]+/).filter(Boolean);
  try {
    for (;;) {
      console.log(`\n=== pixelfx -> Godot  (v${lock.version}) ===
 1) 고정 버전 설치/확인
 2) 이펙트 검색
 3) 미리보기 (contact sheet PNG)
 4) 스프라이트 시트 만들기 (PNG+JSON)
 5) Godot로 가져오기 (시트 + .tres + .tscn)
 0) 종료`);
      const c = await ask("선택> ");
      try {
        if (c === "0" || c === "") break;
        else if (c === "1") ensureInstalled();
        else if (c === "2") search(idsFrom(await ask("검색어> ")));
        else if (c === "3" || c === "4" || c === "5") {
          const ids = idsFrom(await ask("이펙트 id 또는 카테고리 (예: fire/torch, ice)> "));
          const flags = {};
          const opts = await ask('옵션 JSON (예: {"palette":["#102","#43a","#fff"]}, 없으면 엔터)> ');
          if (opts) flags.opts = opts;
          (c === "3" ? preview : c === "4" ? sheet : doImport)(ids, flags);
        } else console.log("0~5 중에서 고르세요.");
      } catch (e) { console.error("오류:", e.message); }
    }
  } finally { rl.close(); }
}

const [cmd, ...rest] = process.argv.slice(2);
const { ids, flags } = parse(rest);
try {
  if (!cmd) await menu();
  else if (cmd === "setup") ensureInstalled();
  else if (cmd === "search") search(ids);
  else if (cmd === "preview") preview(ids, flags);
  else if (cmd === "sheet") sheet(ids, flags);
  else if (cmd === "import") doImport(ids, flags);
  else { console.error(`모르는 명령: ${cmd}\n명령: setup | search | preview | sheet | import (없으면 메뉴)`); process.exit(1); }
} catch (e) { console.error("오류:", e.message); process.exit(1); }
