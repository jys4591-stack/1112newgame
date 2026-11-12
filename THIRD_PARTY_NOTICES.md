# 서드파티 고지 (Third-party notices)

이 프로젝트의 이펙트 스프라이트 시트와 변환 스크립트는 아래 오픈소스를 이용해 만듭니다.
각 저작권 고지와 MIT 허가문은 그 소프트웨어의 사본이나 상당 부분을 배포할 때 함께 넣어야 합니다.

## pixelfx

- 출처: https://github.com/patch-gg/pixelfx (고정 버전 0.3.1, 커밋 `044e12a45dc9cc312cec50ee606dfc98afe5adc2`)
- 라이선스: MIT
- 사용: 이펙트를 코드로 그려 스프라이트 시트(PNG+JSON)로 내보냄 (`tools/fx/`가 `vendor/pixelfx`를 실행)

```
MIT License

Copyright (c) 2026 Patch
Copyright (c) 2026 Hugo Duprez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### pixelfx가 포함한 MIT 코드 (pixelfx NOTICE.md 에서 옮김)

- **Hugo Duprez** — `src/core/sim.js`와 파일 맨 위에 그렇게 적힌 이펙트는 Sprite Fusion의 오픈소스 픽셀 아트 VFX를
  개작했습니다. https://www.spritefusion.com/pixel-art-vfx, Copyright (c) 2026 Hugo Duprez, MIT License.
- **Hollow Crown** — `src/core/act.js`는 Hollow Crown의 스킬 연출 방식(12fps 포즈, 히트스톱, 탄성 있는 허수아비)을
  개작했습니다. https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT License.

위 두 항목의 허가문은 위 pixelfx MIT 허가문과 같은 조건입니다.

## 쓰지 않는 것

- **Patch Pixel 폰트** (pixelfx의 `gallery/fonts`) — Patch 자체 자산이며 MIT 라이선스 대상이 아닙니다.
  이 프로젝트는 쓰지 않습니다. `tools/fx/lib.mjs`가 `vendor/pixelfx`를 받을 때 `gallery/fonts/`를 아예 내려받지 않으며,
  게임에 넣는 파일(`.png`, `.json`, `.tres`, `.tscn`)에는 폰트가 들어가지 않습니다.
