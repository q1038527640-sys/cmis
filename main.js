// ═══════════════════════════════════════════════════════════
// 清迈国际格斗 - UI Controller & Main Game Loop
// ═══════════════════════════════════════════════════════════

const Game = {
  engine: null,
  selectedTeam1: [],
  selectedTeam2: [],
  pendingSkill: null,
  targetMode: false,
  isAITurn: false,
  vsMode: "pvp", // pvp | pve

  // ── Initialize ──
  init() {
    this.engine = new BattleEngine();
    this.showScreen("title-screen");
    this.buildRoster();
  },

  // ── Screen Management ──
  showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  },

  // ── Build character roster in select screen ──
  buildRoster() {
    const grid = document.getElementById("char-grid");
    grid.innerHTML = "";

    Object.values(CHARACTERS).forEach(char => {
      const card = document.createElement("div");
      card.className = `char-card rarity-${char.rarity}`;
      card.dataset.id = char.id;
      card.innerHTML = `
        <span class="char-emoji">${char.emoji}</span>
        <div class="char-name">${char.name}</div>
        <span class="char-rarity">${char.rarity}</span>
        <span class="char-role-tag">${char.role}</span>
      `;
      card.addEventListener("click", () => this.toggleCharSelect(char.id, card));
      grid.appendChild(card);
    });

    this.updateSelectedSlots();
  },

  // ── Toggle character selection ──
  toggleCharSelect(charId, card) {
    const inT1 = this.selectedTeam1.includes(charId);
    const inT2 = this.selectedTeam2.includes(charId);

    if (inT1) {
      this.selectedTeam1 = this.selectedTeam1.filter(id => id !== charId);
      card.classList.remove("selected-t1");
    } else if (inT2) {
      this.selectedTeam2 = this.selectedTeam2.filter(id => id !== charId);
      card.classList.remove("selected-t2");
    } else if (this.vsMode === "pvp") {
      // Fill T1 first, then T2
      if (this.selectedTeam1.length < 4) {
        this.selectedTeam1.push(charId);
        card.classList.add("selected-t1");
      } else if (this.selectedTeam2.length < 4) {
        this.selectedTeam2.push(charId);
        card.classList.add("selected-t2");
      }
    } else {
      // PvE: player picks T1
      if (this.selectedTeam1.length < 4) {
        this.selectedTeam1.push(charId);
        card.classList.add("selected-t1");
      }
    }

    this.updateSelectedSlots();
    this.updateStartButton();
  },

  // ── Update selected slots display ──
  updateSelectedSlots() {
    ["team1", "team2"].forEach((team, ti) => {
      const arr = ti === 0 ? this.selectedTeam1 : this.selectedTeam2;
      for (let i = 0; i < 4; i++) {
        const slot = document.getElementById(`${team}-slot-${i + 1}`);
        if (!slot) continue;
        const charId = arr[i];
        if (charId) {
          const char = CHARACTERS[charId];
          slot.classList.add("filled");
          slot.innerHTML = `
            <span class="slot-emoji">${char.emoji}</span>
            <div class="slot-info">
              <div class="slot-name">${char.name}</div>
              <div class="slot-role">${char.rarity} · ${char.role}</div>
            </div>
            <button class="slot-remove" onclick="Game.removeFromTeam(${ti + 1}, '${charId}')">✕</button>
          `;
        } else {
          slot.classList.remove("filled");
          slot.innerHTML = `<span style="color:var(--text-dim);font-size:12px">空位 ${i + 1}</span>`;
        }
      }
    });

    document.getElementById("t1-count").textContent = `${this.selectedTeam1.length}/4`;
    document.getElementById("t2-count").textContent = `${this.selectedTeam2.length}/4`;
  },

  removeFromTeam(teamNum, charId) {
    if (teamNum === 1) {
      this.selectedTeam1 = this.selectedTeam1.filter(id => id !== charId);
    } else {
      this.selectedTeam2 = this.selectedTeam2.filter(id => id !== charId);
    }
    // Update card style
    document.querySelectorAll(`.char-card[data-id="${charId}"]`).forEach(c => {
      c.classList.remove("selected-t1", "selected-t2");
    });
    this.updateSelectedSlots();
    this.updateStartButton();
  },

  updateStartButton() {
    const btn = document.getElementById("start-battle-btn");
    const ready = this.selectedTeam1.length === 4 && this.selectedTeam2.length === 4;
    btn.disabled = !ready;
    btn.textContent = ready ? "⚔️ 开始战斗！" : `选择角色 (${this.selectedTeam1.length + this.selectedTeam2.length}/8)`;
  },

  // ── Fill random team ──
  autoFillTeams() {
    const allIds = Object.keys(CHARACTERS);
    const shuffled = [...allIds].sort(() => Math.random() - 0.5);
    this.selectedTeam1 = shuffled.slice(0, 4);
    this.selectedTeam2 = shuffled.slice(4, 8);
    this.buildRoster();
    this.updateStartButton();
  },

  // ── Set vs mode ──
  setVsMode(mode) {
    this.vsMode = mode;
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active-mode"));
    document.getElementById(`mode-${mode}`).classList.add("active-mode");
    if (mode === "pve") {
      document.getElementById("team2-panel-info").textContent = "AI将随机选择队伍";
    } else {
      document.getElementById("team2-panel-info").textContent = "点击选择第二队角色";
    }
  },

  // ── Start battle ──
  startBattle() {
    let t2 = this.selectedTeam2;
    if (this.vsMode === "pve" && t2.length < 4) {
      // Auto pick T2
      const remaining = Object.keys(CHARACTERS).filter(id => !this.selectedTeam1.includes(id));
      t2 = remaining.sort(() => Math.random() - 0.5).slice(0, 4);
      this.selectedTeam2 = t2;
    }

    const state = this.engine.setupTeams(this.selectedTeam1, this.selectedTeam2);
    this.showScreen("battle-screen");
    this.renderBattle(state);
  },

  // ── Render full battle state ──
  renderBattle(state) {
    this.renderTeam("team1", state.team1, state.currentChar);
    this.renderTeam("team2", state.team2, state.currentChar);
    this.renderActionPanel(state);
    this.renderLog(state.battleLog);
    this.updateTurnHeader(state);

    if (state.state === "GAMEOVER") {
      setTimeout(() => this.showGameOver(state.winner), 1000);
      return;
    }

    // AI auto-play for team2 in PvE
    if (this.vsMode === "pve" && state.currentTeam === 2 && state.state === "BATTLE") {
      this.doAITurn(state);
    }
  },

  // ── Render a team ──
  renderTeam(teamKey, team, currentChar) {
    const container = document.getElementById(`${teamKey}-chars`);
    container.innerHTML = "";

    team.forEach(char => {
      const isActive = currentChar && char.id === currentChar.id;
      const hpPct = Math.max(0, (char.hp / char.maxHp) * 100);
      const hpColor = hpPct > 50 ? "var(--hp-high)" : hpPct > 25 ? "var(--hp-mid)" : "var(--hp-low)";

      const statusIcons = [
        char.stunned ? "😵" : "",
        char.shield > 0 ? "🛡️" : "",
        (char.buffs || []).some(b => b.stat === "damage" && b.value > 0) ? "⬆️" : "",
        (char.debuffs || []).length > 0 ? "⬇️" : "",
        (char.dots || []).length > 0 ? "☠️" : "",
        (char.curses || []).length > 0 ? "📖" : "",
      ].filter(Boolean).join("");

      const card = document.createElement("div");
      card.className = `battle-char-card ${isActive ? "active-turn" : ""} ${!char.alive ? "dead" : ""} ${char.stunned ? "stunned-char" : ""}`;
      card.dataset.id = char.id;
      card.dataset.team = teamKey;

      card.innerHTML = `
        <div class="b-char-avatar">${char.alive ? char.emoji : "💀"}</div>
        <div class="b-char-info">
          <div class="b-char-name">
            ${char.name}
            <span class="b-char-status-icons">${statusIcons}</span>
          </div>
          <div class="hp-bar-wrap">
            <div class="hp-bar">
              <div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div>
            </div>
            <div class="hp-text">${char.hp}/${char.maxHp}</div>
          </div>
          ${char.shield > 0 ? `<div class="shield-bar">🛡️ ${char.shield}</div>` : ""}
          <div class="stamina-row">
            ${Array(char.maxStamina).fill(0).map((_, i) =>
              `<div class="stamina-pip ${i < char.stamina ? "full" : ""} ${char.stamina <= 2 && i < char.stamina ? "low" : ""}"></div>`
            ).join("")}
          </div>
        </div>
        <div class="b-char-meta">
          <div class="trigger-val ${char.triggerValue >= 10 ? "ready" : ""}">
            ${char.triggerValue >= 10 ? "💥" : "⚡"}${char.triggerValue}/10
          </div>
        </div>
      `;

      // Click to target
      if (char.alive && teamKey === "team2") {
        card.addEventListener("click", () => this.selectTarget(char.id));
      }
      if (char.alive && teamKey === "team1") {
        card.addEventListener("click", () => this.selectAllyTarget(char.id));
      }

      container.appendChild(card);
    });
  },

  // ── Render action panel ──
  renderActionPanel(state) {
    const panel = document.getElementById("action-panel-inner");
    const actor = state.currentChar;
    const isPlayerTurn = state.currentTeam === 1 || this.vsMode === "pvp";

    if (!actor || !isPlayerTurn || state.state !== "BATTLE") {
      panel.innerHTML = `
        <div class="ai-turn-notice">
          ${state.state === "GAMEOVER" ? "战斗结束！" : `⚔️ ${state.currentTeam === 2 ? "Team 2" : ""} 的回合<span class="ai-thinking">...</span>`}
        </div>
      `;
      return;
    }

    const skills = actor.skills || {};
    const skill1 = skills.skill1;
    const skill2 = skills.skill2;
    const skill3 = skills.skill3;
    const ultimate = skills.ultimate;

    panel.innerHTML = `
      <div class="active-char-display">
        <div class="active-char-emoji">${actor.emoji}</div>
        <div>
          <div class="active-char-name">${actor.name}</div>
          <div class="active-char-role">${actor.rarity} · ${actor.role}</div>
          <div class="active-char-trigger">触发值: ${actor.triggerValue}/10 · 体力: ${actor.stamina}/${actor.maxStamina}</div>
        </div>
      </div>

      <div class="skill-buttons" id="skill-btns">
        ${skill1 ? this.renderSkillBtn("skill1", "①", skill1, actor.stamina, actor.stunned) : ""}
        ${skill2 ? this.renderSkillBtn("skill2", "②", skill2, actor.stamina, actor.stunned) : ""}
        ${skill3 ? this.renderSkillBtn("skill3", "③", skill3, actor.stamina, actor.stunned) : ""}
        ${ultimate ? `
          <button class="skill-btn ultimate-btn" onclick="Game.useSkill('ultimate')" ${actor.triggerValue < 10 || actor.stunned ? "disabled" : ""}>
            <span class="skill-btn-icon">💥</span>
            <div class="skill-btn-info">
              <div class="skill-btn-name">${ultimate.name}</div>
              <div class="skill-btn-desc">${ultimate.description}</div>
            </div>
            <span class="skill-cost">${actor.triggerValue >= 10 ? "就绪" : `${actor.triggerValue}/10`}</span>
          </button>
        ` : ""}
        ${actor.reminisce ? `
          <button class="skill-btn reminisce-btn" onclick="Game.useReminisce()" ${actor.reminisceUsed || actor.stunned ? "disabled" : ""}>
            <span class="skill-btn-icon">💫</span>
            <div class="skill-btn-info">
              <div class="skill-btn-name">回想: ${actor.reminisce.name}</div>
              <div class="skill-btn-desc">${actor.reminisce.description || ""}</div>
            </div>
            <span class="skill-cost">${actor.reminisceUsed ? "已用" : "FREE"}</span>
          </button>
        ` : ""}
      </div>

      <div class="target-select" id="target-select">
        <div class="target-select-title">选择目标</div>
        <div id="target-list"></div>
        <button class="btn-danger" onclick="Game.cancelTargetSelect()" style="margin-top:8px">✕ 取消</button>
      </div>
    `;
  },

  renderSkillBtn(key, num, skill, stamina, stunned) {
    const canUse = stamina >= skill.cost && !stunned;
    return `
      <button class="skill-btn" onclick="Game.useSkill('${key}')" ${!canUse ? "disabled" : ""}>
        <span class="skill-btn-icon">${num}</span>
        <div class="skill-btn-info">
          <div class="skill-btn-name">${skill.name}</div>
          <div class="skill-btn-desc">${skill.description}</div>
        </div>
        <span class="skill-cost">⚡${skill.cost}</span>
      </button>
    `;
  },

  // ── Turn header ──
  updateTurnHeader(state) {
    const label = document.getElementById("turn-team-label");
    if (state.currentChar) {
      const isT1 = state.currentTeam === 1;
      label.textContent = isT1 ? `▶ TEAM 1: ${state.currentChar.name}` : `▶ TEAM 2: ${state.currentChar.name}`;
      label.style.color = isT1 ? "var(--accent-cyan)" : "var(--accent-pink)";
      label.style.background = isT1 ? "rgba(0,245,255,0.08)" : "rgba(255,0,128,0.08)";
    }
    document.getElementById("turn-count").textContent = `回合 ${state.turnCount}`;
  },

  // ── Render log ──
  renderLog(entries) {
    const container = document.getElementById("log-entries");
    container.innerHTML = "";
    entries.slice(0, 30).forEach(entry => {
      const div = document.createElement("div");
      div.className = `log-entry ${entry.type}`;
      div.textContent = `T${entry.turn} ${entry.message}`;
      container.appendChild(div);
    });
  },

  // ── Skill usage ──
  useSkill(skillKey) {
    this.pendingSkill = skillKey;
    const actor = this.engine.getCurrentChar();
    if (!actor) return;

    const skill = actor.skills?.[skillKey];
    if (!skill) return;

    // Some skills target allies, some enemies, some all
    const healTypes = ["heal", "buff"];
    if (skillKey === "ultimate") {
      // Usually target enemies
      this.showTargetSelect("enemy");
    } else if (skill.type && healTypes.includes(skill.type)) {
      this.showTargetSelect("ally");
    } else if (skill.type === "special" || skill.type === "mixed") {
      this.showTargetSelect("enemy");
    } else {
      this.showTargetSelect("enemy");
    }
  },

  useReminisce() {
    this.pendingSkill = "reminisce";
    this.showTargetSelect("none");
    this.executeWithTargets([]);
  },

  showTargetSelect(mode) {
    if (mode === "none") return;

    const targetList = document.getElementById("target-list");
    if (!targetList) return;

    document.getElementById("target-select").classList.add("visible");
    document.getElementById("skill-btns").style.display = "none";

    targetList.innerHTML = "";
    const state = this.engine.getState();

    let candidates = [];
    if (mode === "enemy") {
      candidates = (state.currentTeam === 1 ? state.team2 : state.team1).filter(c => c.alive);
    } else if (mode === "ally") {
      candidates = (state.currentTeam === 1 ? state.team1 : state.team2).filter(c => c.alive);
    }

    // Add ALL option for AoE
    if (mode === "enemy" && candidates.length > 1) {
      const allBtn = document.createElement("button");
      allBtn.className = "target-btn";
      allBtn.innerHTML = `<span>⚡</span> 全体敌人`;
      allBtn.addEventListener("click", () => this.executeWithTargets(candidates.map(c => c.id)));
      targetList.appendChild(allBtn);
    }

    candidates.forEach(char => {
      const hpPct = Math.round((char.hp / char.maxHp) * 100);
      const btn = document.createElement("button");
      btn.className = "target-btn";
      btn.innerHTML = `
        <span>${char.emoji}</span>
        <span>${char.name}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--text-secondary)">${char.hp}HP (${hpPct}%)</span>
      `;
      btn.addEventListener("click", () => this.executeWithTargets([char.id]));
      targetList.appendChild(btn);
    });
  },

  selectTarget(charId) {
    if (!this.pendingSkill) return;
    this.executeWithTargets([charId]);
  },

  selectAllyTarget(charId) {
    if (!this.pendingSkill) return;
    const skill = this.engine.getCurrentChar()?.skills?.[this.pendingSkill];
    if (skill && ["heal", "buff"].includes(skill.type)) {
      this.executeWithTargets([charId]);
    }
  },

  cancelTargetSelect() {
    this.pendingSkill = null;
    const targetSelect = document.getElementById("target-select");
    const skillBtns = document.getElementById("skill-btns");
    if (targetSelect) targetSelect.classList.remove("visible");
    if (skillBtns) skillBtns.style.display = "";
  },

  executeWithTargets(targetIds) {
    this.cancelTargetSelect();
    if (!this.pendingSkill) return;

    const skillKey = this.pendingSkill;
    this.pendingSkill = null;

    const state = this.engine.executeAction(
      skillKey === "reminisce" ? "reminisce" : skillKey === "ultimate" ? "ultimate" : "skill",
      skillKey,
      targetIds
    );

    this.renderBattle(state);
  },

  // ── AI Turn ──
  doAITurn(state) {
    const action = this.engine.getAIAction();
    if (!action) return;

    const actor = this.engine.getCurrentChar();

    setTimeout(() => {
      const newState = this.engine.executeAction(action.actionType, action.skillKey, action.targetIds);
      this.renderBattle(newState);
    }, 1200);
  },

  // ── Game Over ──
  showGameOver(winner) {
    this.showScreen("gameover-screen");
    const banner = document.getElementById("winner-banner");
    const sub = document.getElementById("winner-sub");
    banner.className = `winner-banner winner-team${winner}`;
    banner.textContent = `TEAM ${winner} 获胜！`;
    sub.textContent = winner === 1 ? "🏆 光荣的胜利！" : "🏆 反败为胜！";
  },

  // ── Restart ──
  restart() {
    this.engine = new BattleEngine();
    this.selectedTeam1 = [];
    this.selectedTeam2 = [];
    this.pendingSkill = null;
    this.vsMode = "pvp";
    this.showScreen("select-screen");
    this.buildRoster();
    this.updateStartButton();
  },

  backToTitle() {
    this.engine = new BattleEngine();
    this.selectedTeam1 = [];
    this.selectedTeam2 = [];
    this.showScreen("title-screen");
  }
};

// ── Boot ──
document.addEventListener("DOMContentLoaded", () => Game.init());
