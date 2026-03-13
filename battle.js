// ═══════════════════════════════════════════════════════════
// 清迈国际格斗 - 战斗逻辑引擎
// ═══════════════════════════════════════════════════════════

class BattleEngine {
  constructor() {
    this.team1 = [];
    this.team2 = [];
    this.currentTeam = 1;
    this.currentCharacterIndex = 0;
    this.turnCount = 0;
    this.battleLog = [];
    this.state = "SELECT"; // SELECT, BATTLE, GAMEOVER
    this.reminisceUsed = { team1: {}, team2: {} };
  }

  // ── Initialize character instance from template ──
  createCharInstance(charTemplate, teamId) {
    return {
      ...JSON.parse(JSON.stringify({
        id: charTemplate.id,
        name: charTemplate.name,
        emoji: charTemplate.emoji,
        color: charTemplate.color,
        rarity: charTemplate.rarity,
        gender: charTemplate.gender,
        role: charTemplate.role,
        maxHp: charTemplate.maxHp || 1000,
        hp: charTemplate.maxHp || 1000,
        baseDamage: charTemplate.baseDamage || 100,
        maxStamina: charTemplate.maxStamina || 8,
        stamina: charTemplate.startStamina || 5,
        shield: 0,
        triggerValue: 0,
        teamId,
        alive: true,
        stunned: false,
        stunDuration: 0,
        sitOutDuration: 0,
        buffs: [],
        debuffs: [],
        dots: [],
        marks: {},
        curses: [],
        turnCount: 0,
        gpa: 0,
        reminisceUsed: false,
        limitedToSkill1: false,
        defected: false,
      })),
      skills: charTemplate.skills,
      passive: charTemplate.passive,
      reminisce: charTemplate.reminisce,
    };
  }

  // ── Set up teams ──
  setupTeams(team1Ids, team2Ids) {
    this.team1 = team1Ids.map(id => this.createCharInstance(CHARACTERS[id], 1));
    this.team2 = team2Ids.map(id => this.createCharInstance(CHARACTERS[id], 2));
    this.state = "BATTLE";
    this.currentTeam = 1;
    this.currentCharacterIndex = 0;
    this.turnCount = 1;
    this.battleLog = [];
    this.log("⚔️ 战斗开始！清迈国际格斗！", "system");
    return this.getState();
  }

  // ── Get current state snapshot ──
  getState() {
    return {
      team1: this.team1,
      team2: this.team2,
      currentTeam: this.currentTeam,
      currentChar: this.getCurrentChar(),
      turnCount: this.turnCount,
      battleLog: this.battleLog,
      state: this.state,
      winner: this.checkWinner()
    };
  }

  getCurrentChar() {
    const team = this.currentTeam === 1 ? this.team1 : this.team2;
    return team[this.currentCharacterIndex];
  }

  getEnemyTeam() {
    return this.currentTeam === 1 ? this.team2 : this.team1;
  }

  getAllyTeam() {
    return this.currentTeam === 1 ? this.team1 : this.team2;
  }

  // ── Execute action ──
  executeAction(actionType, skillKey, targetIds) {
    const actor = this.getCurrentChar();
    if (!actor || !actor.alive) {
      this.nextTurn();
      return this.getState();
    }

    if (actor.stunned) {
      this.log(`😵 ${actor.name} 被眩晕，跳过回合！`, "stun");
      this.nextTurn();
      return this.getState();
    }

    const enemies = this.getEnemyTeam().filter(c => c.alive);
    const allies = this.getAllyTeam().filter(c => c.alive && c.id !== actor.id);
    const allChars = [...this.team1, ...this.team2].filter(c => c.alive);

    let effects = [];

    if (actionType === "skill") {
      const skill = actor.skills[skillKey];
      if (!skill) return this.getState();

      // Stamina check
      if (skillKey !== "ultimate" && actor.stamina < skill.cost) {
        this.log(`⚠️ ${actor.name} 体力不足！需要${skill.cost}点`, "warning");
        return this.getState();
      }

      // Consume stamina
      if (skillKey !== "ultimate") {
        actor.stamina = Math.max(0, actor.stamina - skill.cost);
      }

      // Add trigger value
      if (skill.triggerValue) {
        actor.triggerValue += skill.triggerValue;
        if (actor.triggerValue >= 10) {
          this.log(`💥 ${actor.name} 触发值满了！大招可用！`, "system");
        }
      }

      // Get target characters
      const targets = targetIds
        .map(id => allChars.find(c => c.id === id))
        .filter(Boolean);

      if (targets.length === 0 && enemies.length > 0) targets.push(enemies[0]);

      this.log(`🔥 ${actor.name} 使用 ${skill.name}！`, "action");

      try {
        effects = skill.execute(actor, targets, allChars, allies);
      } catch (e) {
        console.error("Skill error:", e);
        effects = [];
      }

    } else if (actionType === "ultimate") {
      if (actor.triggerValue < 10) {
        this.log(`⚠️ ${actor.name} 触发值不足（${actor.triggerValue}/10）！`, "warning");
        return this.getState();
      }
      actor.triggerValue = 0;
      const targets = targetIds.map(id => allChars.find(c => c.id === id)).filter(Boolean);
      if (targets.length === 0) targets.push(...enemies);
      this.log(`💥 ${actor.name} 触发大招：${actor.skills.ultimate.name}！`, "ultimate");
      try {
        effects = actor.skills.ultimate.execute(actor, targets, allChars, allies);
      } catch (e) {
        console.error("Ultimate error:", e);
      }

    } else if (actionType === "reminisce") {
      if (actor.reminisceUsed) {
        this.log(`⚠️ ${actor.name} 回想本局已使用！`, "warning");
        return this.getState();
      }
      actor.reminisceUsed = true;
      this.log(`💫 ${actor.name} 使用回想：${actor.reminisce?.name}！`, "reminisce");
      try {
        effects = actor.reminisce?.execute(actor, this.getAllyTeam(), this.getEnemyTeam()) || [];
      } catch (e) {
        console.error("Reminisce error:", e);
      }
    }

    // Apply all effects
    this.applyEffects(effects, actor);

    // Check win condition
    const winner = this.checkWinner();
    if (winner) {
      this.state = "GAMEOVER";
      this.log(`🏆 ${winner === 1 ? "Team 1" : "Team 2"} 获胜！`, "system");
      return this.getState();
    }

    if (actionType !== "reminisce") {
      this.nextTurn();
    }

    return this.getState();
  }

  // ── Apply effect array ──
  applyEffects(effects, actor) {
    const allChars = [...this.team1, ...this.team2];

    for (const effect of effects) {
      const target = allChars.find(c => c.id === effect.target);

      if (effect.text) {
        this.log(effect.text, effect.type || "info");
      }

      if (!target && effect.type !== "text") continue;

      switch (effect.type) {
        case "damage": {
          // Hit location
          const location = this.rollHitLocation();
          let dmg = effect.amount;
          if (location === "head") dmg = Math.floor(dmg * 1.5);
          if (location === "dodge") { this.log(`💨 ${target.name} 躲避了攻击！`, "dodge"); break; }

          // Shield absorption
          if (target.shield > 0) {
            const absorbed = Math.min(target.shield, Math.floor(dmg * 0.5));
            target.shield -= absorbed;
            dmg -= absorbed;
          }
          target.hp = Math.max(0, target.hp - dmg);
          this.log(`💢 ${target.name} 受到 ${dmg} 伤害${location === "head" ? "（爆头！）" : ""}！剩余HP: ${target.hp}`, "damage");
          if (target.hp <= 0) this.killChar(target);
          break;
        }

        case "truedamage": {
          target.hp = Math.max(0, target.hp - effect.amount);
          this.log(`☠️ ${target.name} 受到 ${effect.amount} 真实伤害！剩余HP: ${target.hp}`, "truedamage");
          if (target.hp <= 0) this.killChar(target);
          break;
        }

        case "heal": {
          const overheal = Math.max(0, (target.hp + effect.amount) - target.maxHp);
          target.hp = Math.min(target.maxHp + overheal, target.hp + effect.amount);
          if (overheal > 0) {
            target.shield += overheal;
            this.log(`💚 ${target.name} 回复 ${effect.amount} 生命！超出转换为 ${overheal} 护盾！`, "heal");
          } else {
            this.log(`💚 ${target.name} 回复 ${effect.amount} 生命！(${target.hp}/${target.maxHp})`, "heal");
          }
          break;
        }

        case "shield":
          target.shield = (target.shield || 0) + effect.amount;
          this.log(`🛡️ ${target.name} 获得 ${effect.amount} 护盾！`, "shield");
          break;

        case "stun":
          target.stunned = true;
          target.stunDuration = effect.duration || 1;
          this.log(`😵 ${target.name} 被眩晕 ${effect.duration} 回合！`, "stun");
          break;

        case "buff":
          target.buffs = target.buffs || [];
          target.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
          break;

        case "debuff":
          target.debuffs = target.debuffs || [];
          target.debuffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
          break;

        case "dot":
          target.dots = target.dots || [];
          target.dots.push({ amount: effect.amount, duration: effect.duration });
          break;

        case "stamina":
          target.stamina = Math.min(target.maxStamina, target.stamina + effect.amount);
          break;

        case "staminaBuff":
          target.stamina = Math.min(target.maxStamina, target.stamina + effect.amount);
          break;

        case "stealStamina": {
          const fromChar = allChars.find(c => c.id === effect.from);
          const toChar = allChars.find(c => c.id === effect.to);
          if (fromChar && toChar) {
            const stolen = Math.min(fromChar.stamina, effect.amount);
            fromChar.stamina -= stolen;
            toChar.stamina = Math.min(toChar.maxStamina, toChar.stamina + stolen);
          }
          break;
        }

        case "mark":
          target.marks = target.marks || {};
          target.marks[effect.markType] = Math.min(effect.maxStacks || 3, (target.marks[effect.markType] || 0) + (effect.stacks || 1));
          break;

        case "cleanse":
          target.debuffs = (target.debuffs || []).slice(effect.count || 1);
          break;

        case "curse":
          target.curses = target.curses || [];
          target.curses.push({ skipChance: effect.skipChance, trueDmgRatio: effect.trueDmgRatio, duration: effect.duration });
          break;

        case "sitout":
          target.sitOutDuration = effect.duration || 2;
          target.alive = false;
          this.log(`💤 ${target.name} 下场 ${effect.duration} 回合！`, "sitout");
          break;

        case "ko":
          this.killChar(target);
          break;

        case "reduceTrigger":
          target.triggerValue = Math.max(0, target.triggerValue - (effect.amount || 1));
          break;
      }
    }
  }

  rollHitLocation() {
    const roll = Math.random();
    if (roll < 0.10) return "head";     // 10% headshot
    if (roll < 0.25) return "dodge";    // 15% dodge
    if (roll < 0.625) return "upper";   // ~37.5% upper body
    return "legs";                       // ~37.5% legs
  }

  killChar(char) {
    char.alive = false;
    char.hp = 0;
    this.log(`💀 ${char.name} 被击败！`, "death");
  }

  // ── Advance to next turn ──
  nextTurn() {
    const currentTeam = this.currentTeam === 1 ? this.team1 : this.team2;
    const actor = currentTeam[this.currentCharacterIndex];

    // Tick down effects on current actor
    if (actor) this.tickEffects(actor);

    // Recover stamina for actor
    if (actor && actor.alive) {
      actor.stamina = Math.min(actor.maxStamina, actor.stamina + 1);
      actor.turnCount = (actor.turnCount || 0) + 1;
    }

    // Switch to next character / team
    this.currentCharacterIndex++;
    let nextTeam = this.currentTeam === 1 ? this.team1 : this.team2;

    while (true) {
      if (this.currentCharacterIndex >= nextTeam.length) {
        // Switch teams
        this.currentTeam = this.currentTeam === 1 ? 2 : 1;
        this.currentCharacterIndex = 0;
        nextTeam = this.currentTeam === 1 ? this.team1 : this.team2;
        this.turnCount++;
        // New round - tick DOTs
        this.tickAllDots();
      }

      const next = nextTeam[this.currentCharacterIndex];
      if (!next) break;

      // Skip sitting-out characters
      if (next.sitOutDuration > 0) {
        next.sitOutDuration--;
        if (next.sitOutDuration <= 0) {
          next.alive = true;
          next.stamina = Math.min(next.maxStamina, next.stamina + 2);
          this.log(`🔙 ${next.name} 回归战场！`, "return");
        }
        this.currentCharacterIndex++;
        continue;
      }

      if (next.alive) break;
      this.currentCharacterIndex++;
    }

    // Tick stun on current
    const newActor = (this.currentTeam === 1 ? this.team1 : this.team2)[this.currentCharacterIndex];
    if (newActor && newActor.stunned) {
      newActor.stunDuration--;
      if (newActor.stunDuration <= 0) {
        newActor.stunned = false;
        this.log(`😤 ${newActor.name} 从眩晕中恢复！`, "info");
      }
    }
  }

  tickEffects(char) {
    char.buffs = (char.buffs || []).filter(b => {
      b.duration--;
      return b.duration > 0;
    });
    char.debuffs = (char.debuffs || []).filter(d => {
      d.duration--;
      return d.duration > 0;
    });
    char.curses = (char.curses || []).filter(c => {
      c.duration--;
      return c.duration > 0;
    });
  }

  tickAllDots() {
    [...this.team1, ...this.team2].forEach(char => {
      if (!char.alive) return;
      char.dots = (char.dots || []).filter(dot => {
        char.hp = Math.max(0, char.hp - dot.amount);
        this.log(`☠️ ${char.name} 受到 ${dot.amount} 持续伤害！`, "dot");
        if (char.hp <= 0) this.killChar(char);
        dot.duration--;
        return dot.duration > 0;
      });

      // Curse tick
      (char.curses || []).forEach(curse => {
        if (Math.random() < curse.skipChance) {
          const trueDmg = Math.floor(char.maxHp * curse.trueDmgRatio);
          char.hp = Math.max(0, char.hp - trueDmg);
          this.log(`📖 ${char.name} 命运诅咒！受到 ${trueDmg} 真伤，跳过行动！`, "curse");
          if (char.hp <= 0) this.killChar(char);
        }
      });
    });
  }

  checkWinner() {
    const t1Alive = this.team1.some(c => c.alive);
    const t2Alive = this.team2.some(c => c.alive);
    if (!t1Alive) return 2;
    if (!t2Alive) return 1;
    return null;
  }

  log(message, type = "info") {
    this.battleLog.unshift({ message, type, turn: this.turnCount });
    if (this.battleLog.length > 100) this.battleLog.pop();
  }

  // ── AI for team 2 ──
  getAIAction() {
    const actor = this.getCurrentChar();
    if (!actor) return null;

    const enemies = this.getEnemyTeam().filter(c => c.alive);
    if (enemies.length === 0) return null;

    // Ultimate if available
    if (actor.triggerValue >= 10) {
      return { actionType: "ultimate", skillKey: null, targetIds: enemies.map(e => e.id) };
    }

    // Pick best affordable skill
    const skills = ["skill3", "skill2", "skill1"];
    for (const sk of skills) {
      const skill = actor.skills?.[sk];
      if (skill && actor.stamina >= skill.cost) {
        // Healing skills target allies
        if (skill.type === "heal" || skill.type === "buff") {
          const allies = this.getAllyTeam().filter(c => c.alive);
          const lowestAlly = allies.sort((a, b) => a.hp - b.hp)[0];
          return { actionType: "skill", skillKey: sk, targetIds: [lowestAlly?.id || enemies[0].id] };
        }
        // Attack skills target lowest HP enemy
        const weakestEnemy = enemies.sort((a, b) => a.hp - b.hp)[0];
        return { actionType: "skill", skillKey: sk, targetIds: [weakestEnemy.id] };
      }
    }

    // Fallback: skill1
    const weakestEnemy = enemies.sort((a, b) => a.hp - b.hp)[0];
    return { actionType: "skill", skillKey: "skill1", targetIds: [weakestEnemy.id] };
  }
}

// Export for use
window.BattleEngine = BattleEngine;
window.calcDamage = calcDamage;
