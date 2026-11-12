// pixelfx 스프라이트 시트(PNG+JSON) -> Godot 4 SpriteFrames(.tres) + 바로 쓰는 씬(.tscn)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { config, godotFxRoot, ROOT } from "./lib.mjs";

const ONESHOT_GD = `extends AnimatedSprite2D
# 한 번 재생되는 이펙트: 끝나면 스스로 사라진다.
func _ready() -> void:
\tanimation_finished.connect(queue_free)
`;

const resPath = (...p) => "res://" + join(config.godotFxDir, ...p).replaceAll("\\", "/");
const rel1 = (x) => (Math.abs(x - 1) < 0.05 ? 1 : x); // 33ms vs 33.33ms 같은 반올림 오차는 1.0 으로
const num = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(4)));

/** sheetDir: render.mjs --sheet 가 만든 폴더(<name>.png|json). id 예: "fire/torch" */
export function importToGodot(sheetDir, id) {
  const name = id.split("/")[1];
  const png = join(sheetDir, `${name}.png`);
  const jsonFile = join(sheetDir, `${name}.json`);
  if (!existsSync(png) || !existsSync(jsonFile)) throw new Error(`시트가 없음: ${sheetDir}`);
  const sheet = JSON.parse(readFileSync(jsonFile, "utf8"));
  const px = sheet.meta.pixelfx;
  const dest = join(godotFxRoot(), id);
  mkdirSync(dest, { recursive: true });
  copyFileSync(png, join(dest, `${name}.png`));
  copyFileSync(jsonFile, join(dest, `${name}.json`));

  // SpriteFrames
  const n = sheet.frames.length;
  let tres = `[gd_resource type="SpriteFrames" load_steps=${n + 2} format=3]\n\n`;
  tres += `[ext_resource type="Texture2D" path="${resPath(id, `${name}.png`)}" id="1_tex"]\n\n`;
  sheet.frames.forEach((f, i) => {
    const r = f.frame;
    tres += `[sub_resource type="AtlasTexture" id="AtlasTexture_${i}"]\natlas = ExtResource("1_tex")\nregion = Rect2(${r.x}, ${r.y}, ${r.w}, ${r.h})\n\n`;
  });
  // duration 은 1/fps 에 대한 프레임 상대 길이. 모든 프레임이 같으면 1.0.
  const base = 1000 / px.fps;
  const frames = sheet.frames
    .map((f, i) => `{\n"duration": ${num(rel1((f.duration ?? base) / base))},\n"texture": SubResource("AtlasTexture_${i}")\n}`)
    .join(", ");
  tres += `[resource]\nanimations = [{\n"frames": [${frames}],\n"loop": ${px.loop},\n"name": &"default",\n"speed": ${num(px.fps)}\n}]\n`;
  writeFileSync(join(dest, `${name}.tres`), tres);

  // 씬: 노드 원점 = 이펙트의 pivot(보통 발밑). 최근접 필터(픽셀 아트).
  const [pvx, pvy] = px.pivot;
  const pascal = name.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
  const oneShot = !px.loop;
  let tscn = `[gd_scene load_steps=${oneShot ? 3 : 2} format=3]\n\n`;
  tscn += `[ext_resource type="SpriteFrames" path="${resPath(id, `${name}.tres`)}" id="1_frames"]\n`;
  if (oneShot) tscn += `[ext_resource type="Script" path="${resPath("fx_oneshot.gd")}" id="2_script"]\n`;
  tscn += `\n[node name="${pascal}" type="AnimatedSprite2D"]\ntexture_filter = 1\ncentered = false\noffset = Vector2(${-pvx}, ${-pvy})\nsprite_frames = ExtResource("1_frames")\nanimation = &"default"\nautoplay = "default"\n`;
  if (oneShot) tscn += `script = ExtResource("2_script")\n`;
  writeFileSync(join(dest, `${name}.tscn`), tscn);

  if (oneShot) {
    const gd = join(godotFxRoot(), "fx_oneshot.gd");
    if (!existsSync(gd)) writeFileSync(gd, ONESHOT_GD);
  }
  return { dir: dest, scene: resPath(id, `${name}.tscn`), loop: px.loop, fps: px.fps, frames: n };
}

export const rel = (p) => relative(ROOT, p).replaceAll("\\", "/");
