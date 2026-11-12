# 프로젝트 규칙

- 픽셀 이펙트, 스프라이트 애니메이션, 스프라이트 시트 작업은 항상 `.claude/skills/pixelfx` 스킬을 사용한다.
- pixelfx는 `pixelfx.lock.json`에 고정된 버전만 쓴다. 이펙트는 `npm run fx`(메뉴) 또는 `npm run fx:import -- <id>`로 Godot에 가져온다. 자세한 내용은 `docs/pixelfx.md`.
- 서드파티 고지는 `THIRD_PARTY_NOTICES.md`에 둔다. pixelfx의 Patch Pixel 폰트(`gallery/fonts`)는 쓰지 않고 내려받지도 않는다.
