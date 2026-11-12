# pixelfx → 스프라이트 시트 → Godot

필요한 것: Node 18 이상, git (인터넷으로 GitHub 접속). GIF/MP4 미리보기를 쓰려면 ffmpeg(선택).

## 버전 고정

`pixelfx.lock.json`이 pixelfx의 정확한 커밋(`044e12a`, v0.3.1)을 가리킵니다. 처음 실행하면
`vendor/pixelfx/`(git에는 안 올라감)에 그 커밋만 받아 오고, 이미 받았으면 확인만 합니다.
버전을 올리려면 `pixelfx.lock.json`의 `version`과 `commit`을 바꾸세요.

## 메뉴

```bash
npm run fx
```

1 설치/확인 · 2 검색 · 3 미리보기 · 4 시트(PNG+JSON) · 5 Godot로 가져오기

## 명령

```bash
npm run fx:search -- frost
npm run fx:preview -- ice/frost-nova            # art/fx/ice/frost-nova/contact.png 를 열어 눈으로 확인
npm run fx:sheet  -- ice/frost-nova             # art/fx/<id>/<이름>.png + .json
npm run fx:import -- ice/frost-nova fire/torch  # 위 + godot/assets/fx/<id>/ 에 .tres .tscn
npm run fx:import -- ice                        # 카테고리 전체
npm run fx:import -- fire/torch --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}' --seed 3
```

`--opts`(색·크기 등), `--seed`, `--fps`, `--bg`는 pixelfx의 `render.mjs`로 그대로 넘어갑니다.

## Godot 쪽

경로는 `fx.config.json`에서 바꿉니다 (기본: 프로젝트 폴더 `godot/`, 안쪽 `assets/fx/`).

가져오면 이펙트마다 이런 파일이 생깁니다.

- `<이름>.png`, `<이름>.json` — 투명 스프라이트 시트와 Aseprite 형식 JSON
- `<이름>.tres` — 시트를 프레임별로 자른 `SpriteFrames` (애니메이션 이름 `default`, fps 반영, 반복 여부 반영)
- `<이름>.tscn` — 바로 `instantiate()` 하는 `AnimatedSprite2D` 씬. 노드 원점이 이펙트의 pivot(보통 발밑)이고 텍스처 필터는 Nearest
- 한 번 재생되는 이펙트는 끝나면 스스로 `queue_free` 하는 `fx_oneshot.gd`가 붙습니다

```gdscript
var fx := preload("res://assets/fx/ice/frost-nova/frost-nova.tscn").instantiate()
fx.position = hero.global_position
get_tree().current_scene.add_child(fx)
```

주의: 한 번 재생되는 이펙트에서 캐릭터 타격 타이밍(wind-up, hit-stop)이 필요하면 시트 JSON의
`meta.pixelfx.act`를 읽으세요. 밝은 배경에서는 빛(glow)이 색으로 구워져 있어 어두운 레이어에 얹는 편이 좋습니다.
