# 清迈国际格斗 Ver 2.4
### CHIANGMAI INTERNATIONAL COMBAT OFFICIAL SERVER

> A browser-based 4v4 fighting card game inspired by real characters from CMAC.

---

## 🎮 How to Play

1. Open `index.html` in any browser — no install needed
2. Select 4 characters per team (or use Quick Match for random)
3. Choose PvP (2 players) or PvE (vs AI)
4. Use skills, manage stamina, build trigger value → unleash Ultimates

---

## ⚡ Game Mechanics

| System | Details |
|---|---|
| **HP** | 1000 base · excess healing → Shield |
| **Shield** | Blocks 50% of incoming damage |
| **Stamina** | Max 8 · Starts 5 · +1/turn · Skills cost 1-5 |
| **Trigger Value** | Skills add 2/3/4 points → at 10 → Ultimate! |
| **Hit Locations** | 10% Headshot (×1.5) · 15% Dodge · 37.5% Upper · 37.5% Legs |
| **True Damage** | Bypasses shields and resistances |

---

## 🏆 Character Roster (14 Characters)

| Name | Rarity | Role | Special |
|---|---|---|---|
| Woojoo | SSSR | 攻击/弱化 | 灌篮 65% 成功率，三分绿色杀手 |
| Jeff | SSSR | 治疗 | 全队治疗，召唤四大天王 |
| Madame | SSSR | 攻击/弱化 | 薯条标记，命运书写 |
| Zane | SSR | 强化 | 通灵术三选一，里香大招 |
| Jake | SSR | 攻击 | 自动爆头三分，Model加成 |
| Lucas | SSR | 攻击/弱化 | GPA系统，Arcaea领域展开 |
| Harrison | SSR | 强化/攻击 | 数值窃取，钢铁血肘 |
| Michelle | SSR | 弱化 | 钞能力叛变，老虎机领域 |
| Cici | SR | 弱化 | 一万IQ眩晕，替身使者 |
| Vincent | SR | 攻击 | 公主抱摔，掰手腕领域 |
| Charlotte | SR | 强化 | 技能复刻，Zane羁绊 |
| LJ | SR | 攻击 | 咒言，背叛力量 |
| Trex | SR | 弱化 | 钥匙扣雨，中间商差价 |
| Feliz | R | 强化 | YouTuber Aura，孤独离场被动 |

---

## 🚀 Deploy to GitHub Pages

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/chiangmai-fight-4v4.git
cd chiangmai-fight-4v4

# 2. Copy all game files into the folder

# 3. Push to GitHub
git add .
git commit -m "Initial release: CMAC 4v4 Fighting Game"
git push origin main

# 4. Enable GitHub Pages
# Go to: Settings → Pages → Source: main branch → Save
# Your game will be live at: https://YOUR_USERNAME.github.io/chiangmai-fight-4v4
```

---

## 📁 File Structure

```
chiangmai-fight-4v4/
├── index.html          ← Main game page
├── css/
│   └── style.css       ← All styles (Neon Brutalist theme)
├── js/
│   ├── characters.js   ← All 14 character data + skill logic
│   ├── battle.js       ← Battle engine (damage, effects, AI)
│   └── main.js         ← UI controller + game loop
└── README.md
```

---

*Made with ❤️ for CMAC Ver 2.4*
