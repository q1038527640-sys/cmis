// ═══════════════════════════════════════════════════════════
// 清迈国际格斗 - 角色数据库
// ═══════════════════════════════════════════════════════════

const CHARACTERS = {
  woojoo: {
    id: "woojoo",
    name: "Woojoo",
    rarity: "SSSR",
    gender: "male",
    role: "攻击/弱化",
    emoji: "🏀",
    color: "#00C896",
    description: "高塔压制者，篮球天才",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "篮球攻击",
        type: "magic",
        cost: 1,
        triggerValue: 2,
        description: "100%法术伤害",
        execute(user, targets, allTargets) {
          const target = targets[0];
          const dmg = calcDamage(user, target, 1.0, "magic");
          return [{ type: "damage", target: target.id, amount: dmg, text: `🏀 篮球攻击！` }];
        }
      },
      skill2: {
        name: "身高压制",
        type: "control",
        cost: 2,
        triggerValue: 3,
        description: "敌方一名角色无法行动一回合，攻击力-15%",
        execute(user, targets, allTargets) {
          const target = targets[0];
          const dmg = calcDamage(user, target, 0.85, "magic");
          return [
            { type: "damage", target: target.id, amount: dmg, text: `📏 身高压制！` },
            { type: "stun", target: target.id, duration: 1 },
            { type: "debuff", target: target.id, stat: "damage", value: -0.15, duration: 1 }
          ];
        }
      },
      skill3: {
        name: "通灵术：灌篮",
        type: "magic",
        cost: 4,
        triggerValue: 4,
        description: "65%几率灌篮成功造成250%伤害，失败自损10%HP",
        execute(user, targets, allTargets) {
          const target = targets[0];
          const roll = Math.random();
          if (roll < 0.65) {
            let mult = 2.5;
            const blockRoll = Math.random();
            if (blockRoll > 0.35) {
              const alleyRoll = Math.random();
              if (alleyRoll < 0.30) mult += 1.0;
              const dmg = calcDamage(user, target, mult, "magic");
              return [{ type: "damage", target: target.id, amount: dmg, text: `🔥 灌篮成功！` }];
            } else {
              return [{ type: "text", text: "😤 被防守成功！" }];
            }
          } else {
            const selfDmg = Math.floor(user.maxHp * 0.1);
            return [
              { type: "damage", target: user.id, amount: selfDmg, text: `😭 灌篮失败！-10000 aura` }
            ];
          }
        }
      },
      ultimate: {
        name: "绿色杀手",
        type: "magic",
        description: "连续三分，每球80%法术伤害，成功率递减",
        execute(user, targets, allTargets) {
          const effects = [];
          let totalDmg = 0;
          for (let x = 1; x <= 3; x++) {
            const prob = Math.pow(0.7, x - 1);
            if (Math.random() < prob) {
              const dmg = calcDamage(user, targets[0], 0.8, "magic");
              totalDmg += dmg;
              effects.push({ type: "damage", target: targets[0].id, amount: dmg, text: `🏀 第${x}球进了！` });
            } else {
              effects.push({ type: "text", text: `😬 第${x}球投丢了...` });
              break;
            }
          }
          return effects;
        }
      }
    },
    passive: {
      name: "篮球反击",
      description: "被攻击腿部时，眩晕攻击者一回合",
      onHit(user, attacker, location) {
        if (location === "legs") {
          return [{ type: "stun", target: attacker.id, duration: 1, text: "🦵 腿部反击眩晕！" }];
        }
        return [];
      }
    },
    reminisce: {
      name: "CMAC的绝杀",
      description: "全队+30%攻击，恢复20%生命",
      execute(user, team) {
        return team.map(m => ({
          type: "buff", target: m.id, stat: "damage", value: 0.30, duration: 1,
          text: `💚 ${m.name} 获得CMAC加成！`
        })).concat(team.map(m => ({
          type: "heal", target: m.id, amount: Math.floor(m.maxHp * 0.2)
        })));
      }
    }
  },

  jeff: {
    id: "jeff",
    name: "Jeff",
    rarity: "SSSR",
    gender: "male",
    role: "治疗",
    emoji: "🍬",
    color: "#FF6B9D",
    description: "糖果心态，全队守护者",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "夹克连拳",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "召唤夹克连续出拳80%伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.8, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "🥊 夹克连拳！" }];
        }
      },
      skill2: {
        name: "Dab Me Up",
        type: "heal",
        cost: 2,
        triggerValue: 3,
        description: "为一名队友恢复20%生命值",
        execute(user, targets) {
          const target = targets[0];
          const heal = Math.floor(target.maxHp * 0.2);
          return [{ type: "heal", target: target.id, amount: heal, text: "🤜 Dab Me Up！恢复生命！" }];
        }
      },
      skill3: {
        name: "Where My Hug At",
        type: "heal",
        cost: 4,
        triggerValue: 4,
        description: "最近两位队员拥抱恢复50%生命",
        execute(user, targets) {
          return targets.slice(0, 2).map(t => ({
            type: "heal", target: t.id, amount: Math.floor(t.maxHp * 0.5),
            text: `🤗 ${t.name} 获得拥抱！恢复50%生命！`
          }));
        }
      },
      ultimate: {
        name: "通灵术：四大天王",
        type: "magic",
        description: "召唤四位式神，各造成110%伤害",
        execute(user, targets) {
          const effects = [];
          for (let i = 0; i < 4; i++) {
            const t = targets[i % targets.length];
            const dmg = calcDamage(user, t, 1.1, "magic");
            effects.push({ type: "damage", target: t.id, amount: dmg, text: `👊 四大天王第${i+1}击！` });
          }
          return effects;
        }
      }
    },
    passive: {
      name: "糖果心态",
      description: "每回合10%概率与敌方女角色同时下场两回合",
      onTurnStart(user, enemies) {
        if (Math.random() < 0.10) {
          const femaleEnemies = enemies.filter(e => e.gender === "female" && e.alive);
          if (femaleEnemies.length > 0) {
            const target = femaleEnemies[Math.floor(Math.random() * femaleEnemies.length)];
            return [
              { type: "sitout", target: user.id, duration: 2, text: `💕 Jeff与${target.name}一起休息两回合！` },
              { type: "sitout", target: target.id, duration: 2 }
            ];
          }
        }
        return [];
      }
    },
    reminisce: {
      name: "Chocolate Covered Skittles",
      description: "戴上墨镜，全队+10%攻击，自身+30%法术攻击",
      execute(user, team) {
        const effects = team.filter(m => m.id !== user.id).map(m => ({
          type: "buff", target: m.id, stat: "damage", value: 0.1, duration: 1
        }));
        effects.push({ type: "buff", target: user.id, stat: "magicDamage", value: 0.3, duration: 1, text: "😎 墨镜上脸！" });
        return effects;
      }
    }
  },

  jake: {
    id: "jake",
    name: "Jake",
    rarity: "SSR",
    gender: "male",
    role: "攻击",
    emoji: "🎯",
    color: "#FFB347",
    description: "爆头射手，精准狙击",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "Psh Psh Psh 连拳",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "20%+35%+45%体术伤害三连击",
        execute(user, targets) {
          const t = targets[0];
          const mults = [0.20, 0.35, 0.45];
          return mults.map((m, i) => ({
            type: "damage", target: t.id,
            amount: calcDamage(user, t, m, "physical"),
            text: i === 0 ? "👊 Psh!" : i === 1 ? "💥 Psh Psh!" : "🔥 PSH!"
          }));
        }
      },
      skill2: {
        name: "I Am A Model",
        type: "buff",
        cost: 2,
        triggerValue: 3,
        description: "下一回合攻击+30%",
        execute(user, targets) {
          return [{ type: "buff", target: user.id, stat: "damage", value: 0.3, duration: 1, text: "💅 I Am A Model！下回合攻击+30%！" }];
        }
      },
      skill3: {
        name: "超远三分爆头",
        type: "magic",
        cost: 3,
        triggerValue: 4,
        description: "150%法术伤害，自动爆头×150%",
        execute(user, targets) {
          const t = targets[0];
          const base = calcDamage(user, t, 1.5, "magic");
          const headshot = Math.floor(base * 1.5);
          return [{ type: "damage", target: t.id, amount: headshot, text: "🎯 超远三分爆头！×150%！" }];
        }
      },
      ultimate: {
        name: "通灵术：丝滑连招+底角三分",
        type: "mixed",
        description: "3-4次三分，每次对全体造成45%体术+45%法术",
        execute(user, targets) {
          const effects = [];
          const shots = Math.random() < 0.5 ? 4 : 3;
          for (let i = 0; i < shots; i++) {
            targets.forEach(t => {
              const pdmg = calcDamage(user, t, 0.45, "physical");
              const mdmg = calcDamage(user, t, 0.45, "magic");
              effects.push({ type: "damage", target: t.id, amount: pdmg + mdmg, text: `🏀 底角三分第${i+1}球！` });
            });
          }
          return effects;
        }
      }
    },
    passive: {
      name: "Model优先",
      description: "二技能后行动顺序提前至增益/治疗后第一",
    },
    reminisce: {
      name: "丝滑后撤步",
      description: "本回合命中率+50%",
      execute(user, team) {
        return [{ type: "buff", target: user.id, stat: "accuracy", value: 0.5, duration: 1, text: "✨ 丝滑后撤步！命中率+50%！" }];
      }
    }
  },

  zane: {
    id: "zane",
    name: "Zane",
    rarity: "SSR",
    gender: "male",
    role: "强化",
    emoji: "🔮",
    color: "#9B59B6",
    description: "咒术大师，召唤系强化者",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "Psh Psh Psh",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "95%体术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.95, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "👊 Psh Psh Psh！" }];
        }
      },
      skill2: {
        name: "Integrated Algebra 2",
        type: "buff",
        cost: 2,
        triggerValue: 3,
        description: "队友法术/体术+20%两回合，自身回复10%HP",
        execute(user, targets) {
          const effects = targets.slice(0, 1).map(t => ({
            type: "buff", target: t.id, stat: "damage", value: 0.2, duration: 2,
            text: `📚 ${t.name} 获得Algebra加成！`
          }));
          effects.push({ type: "heal", target: user.id, amount: Math.floor(user.maxHp * 0.1) });
          return effects;
        }
      },
      skill3: {
        name: "通灵术",
        type: "mixed",
        cost: 4,
        triggerValue: 4,
        description: "召唤Lucas/Vincent/Harrison之一随机攻击",
        execute(user, targets) {
          const roll = Math.random();
          if (roll < 0.33) {
            const dmg = calcDamage(user, targets[0], 1.5, "magic");
            return [{ type: "damage", target: targets[0].id, amount: dmg, text: "💬 Lucas咒言：Ur MOM！150%法术！" }];
          } else if (roll < 0.66) {
            const dmg = calcDamage(user, targets[0], 1.5, "physical");
            return [{ type: "damage", target: targets[0].id, amount: dmg, text: "🤗 Vincent公主抱！150%体术！" }];
          } else if (roll < 0.99) {
            const shots = 3 + (Math.random() < 0.6 ? Math.floor(Math.random() * 3) : 0);
            return Array(shots).fill(0).map((_, i) => ({
              type: "damage", target: targets[0].id,
              amount: calcDamage(user, targets[0], 0.4, "magic"),
              text: `👟 Harrison投鞋第${i+1}鞋！`
            }));
          } else {
            return targets.map(t => ({
              type: "damage", target: t.id,
              amount: calcDamage(user, t, 1.5, "physical") + calcDamage(user, t, 1.5, "magic"),
              text: "🏔️ 后山降临！全体150%+150%！"
            }));
          }
        }
      },
      ultimate: {
        name: "通灵术：里香",
        type: "magic",
        description: "随机对敌方两人造成200-500%法术伤害",
        execute(user, targets) {
          const shuffled = [...targets].sort(() => Math.random() - 0.5).slice(0, 2);
          return shuffled.map(t => {
            const mult = 2.0 + Math.random() * 3.0;
            return {
              type: "damage", target: t.id,
              amount: calcDamage(user, t, mult, "magic"),
              text: `🌸 里香：${(mult * 100).toFixed(0)}%法术！`
            };
          });
        }
      }
    },
    passive: {
      name: "轮换战士",
      description: "每5回合下场一回合，回来时+2触发值和体力",
    },
    reminisce: {
      name: "你说谁是ginger?",
      description: "两回合法术+30%，生命+5%（需与夏洛特同队且夏洛特血量<50%）",
      execute(user, team) {
        return [
          { type: "buff", target: user.id, stat: "magicDamage", value: 0.3, duration: 2, text: "😤 谁说我是ginger？！法术+30%！" },
          { type: "heal", target: user.id, amount: Math.floor(user.maxHp * 0.05) }
        ];
      }
    }
  },

  vincent: {
    id: "vincent",
    name: "Vincent",
    rarity: "SR",
    gender: "male",
    role: "攻击",
    emoji: "💪",
    color: "#E74C3C",
    description: "毁灭之力，近战暴力输出",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "出拳",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "100%体术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 1.0, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "👊 直拳！" }];
        }
      },
      skill2: {
        name: "扫堂腿",
        type: "physical",
        cost: 3,
        triggerValue: 3,
        description: "165%体术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 1.65, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "🦵 扫堂腿！165%！" }];
        }
      },
      skill3: {
        name: "公主抱",
        type: "physical",
        cost: 3,
        triggerValue: 4,
        description: "150%体术伤害，75%触发抱摔+30%额外伤害",
        execute(user, targets) {
          const t = targets[0];
          const base = calcDamage(user, t, 1.5, "physical");
          if (Math.random() < 0.75) {
            const bonus = Math.floor(base * 0.3);
            return [{ type: "damage", target: t.id, amount: base + bonus, text: "💃 公主抱摔！+30%额外伤害！" }];
          }
          return [{ type: "damage", target: t.id, amount: base, text: "🤲 公主抱！150%！" }];
        }
      },
      ultimate: {
        name: "领域展开：掰手腕",
        type: "special",
        description: "全员掰手腕，敌方90%概率输造成120%法术伤害",
        execute(user, targets) {
          const effects = [];
          targets.forEach(t => {
            const roll = Math.random();
            if (roll < 0.90) {
              const dmg = calcDamage(user, t, 1.2, "magic");
              effects.push({ type: "damage", target: t.id, amount: dmg, text: `💪 ${t.name} 掰手腕输了！` });
            } else if (roll < 0.9975) {
              effects.push({ type: "text", text: `😤 ${t.name} 勉强赢了！伤害抵消！` });
            } else {
              effects.push({ type: "ko", target: user.id, text: "😱 Vincent抽筋！直接暴毙！" });
            }
          });
          return effects;
        }
      }
    },
    passive: {
      name: "矮个子弱点",
      description: "被Woojoo身高压制会眩晕两回合（每局一次）",
    },
    reminisce: {
      name: "番茄的痛",
      description: "下一次技能必中，体术伤害翻倍",
      execute(user, team) {
        return [
          { type: "buff", target: user.id, stat: "guaranteed", value: 1, duration: 1 },
          { type: "buff", target: user.id, stat: "physicalDamage", value: 1.0, duration: 1, text: "🍅 番茄的痛！体术伤害翻倍！" }
        ];
      }
    }
  },

  lucas: {
    id: "lucas",
    name: "Lucas",
    rarity: "SSR",
    gender: "male",
    role: "攻击/弱化",
    emoji: "📊",
    color: "#3498DB",
    description: "数学天才，GPA战士",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    gpa: 0,
    skills: {
      skill1: {
        name: "考试99%",
        type: "magic",
        cost: 1,
        triggerValue: 2,
        description: "101%法术伤害，获得0.9 GPA",
        execute(user, targets) {
          user.gpa = (user.gpa || 0) + 0.9;
          const dmg = calcDamage(user, targets[0], 1.01, "magic");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: `📝 考试99%！GPA: ${user.gpa.toFixed(1)}` }];
        }
      },
      skill2: {
        name: "AP Precal Pro Max",
        type: "buff",
        cost: 2,
        triggerValue: 3,
        description: "下一回合技能按公式增强",
        execute(user, targets) {
          const bonus = ((user.hp / 100) + (user.gpa || 0) * 5 * (user.turnCount || 1)) * 0.1;
          return [{ type: "buff", target: user.id, stat: "damage", value: bonus, duration: 1, text: `📐 AP Precal加成！+${(bonus * 100).toFixed(0)}%！` }];
        }
      },
      skill3: {
        name: "打不打使命",
        type: "mixed",
        cost: 3,
        triggerValue: 4,
        description: "全体200%体术+持续50%法术，随机眩晕一名",
        execute(user, targets) {
          const effects = [];
          targets.forEach(t => {
            const dmg = calcDamage(user, t, 2.0, "physical");
            effects.push({ type: "damage", target: t.id, amount: dmg });
            effects.push({ type: "dot", target: t.id, amount: calcDamage(user, t, 0.5, "magic"), duration: 4, text: `🎮 ${t.name} 受到持续法术伤害！` });
          });
          const stunTarget = targets[Math.floor(Math.random() * targets.length)];
          effects.push({ type: "stun", target: stunTarget.id, duration: 1, text: `😵 ${stunTarget.name} 被眩晕！` });
          return effects;
        }
      },
      ultimate: {
        name: "领域展开：Arcaea",
        type: "special",
        description: "随机技能伤害*2221判定，按结果造成不同程度伤害",
        execute(user, targets) {
          const effects = [];
          targets.forEach(t => {
            const score = Math.random() * 100 * 2221;
            let dmgRatio = 0;
            let resultText = "";
            if (score < 8900000) { dmgRatio = 1.0; resultText = "💀 TL！秒杀！"; }
            else if (score < 9200000) { dmgRatio = 0.75; resultText = "😱 TL！75%生命伤害！"; }
            else if (score < 9500000) { dmgRatio = 0.60; resultText = "😨 60%当前生命伤害！"; }
            else if (score < 9800000) { dmgRatio = 0.40; resultText = "😰 40%当前生命伤害！"; }
            else if (score < 9900000) { dmgRatio = 0.20; resultText = "😅 20%当前生命伤害！"; }
            else if (score < 10002221) { dmgRatio = 0.10; resultText = "😌 10%当前生命伤害！"; }
            else { resultText = "✅ 满分！不受伤害！"; }

            if (dmgRatio > 0) {
              const dmg = score < 8900000 ? t.maxHp : Math.floor(t.hp * dmgRatio);
              effects.push({ type: "damage", target: t.id, amount: dmg, text: `🎵 Arcaea判定 ${Math.floor(score/10000)}: ${resultText}` });
            } else {
              effects.push({ type: "text", text: `🎵 ${t.name} Arcaea满分！不受伤害！` });
            }
          });
          return effects;
        }
      }
    },
    passive: { name: "GPA积累", description: "使用一技能积累GPA，增强二技能效果" }
  },

  harrison: {
    id: "harrison",
    name: "Harrison",
    rarity: "SSR",
    gender: "male",
    role: "强化/攻击",
    emoji: "👟",
    color: "#E67E22",
    description: "血腥钢铁，数值窃取者",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "大急拔跳投",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "90%命中，110%体术伤害",
        execute(user, targets) {
          if (Math.random() < 0.9) {
            const dmg = calcDamage(user, targets[0], 1.1, "physical");
            return [{ type: "damage", target: targets[0].id, amount: dmg, text: "🏀 大急拔跳投命中！" }];
          }
          return [{ type: "text", text: "😬 跳投偏了！" }];
        }
      },
      skill2: {
        name: "数值窃取",
        type: "buff",
        cost: 4,
        triggerValue: 3,
        description: "窃取场上所有玩家2%的伤害和生命",
        execute(user, targets, allTargets) {
          const stolen = allTargets.reduce((sum, t) => sum + t.maxHp * 0.02, 0);
          return [
            { type: "steal", target: user.id, amount: Math.floor(stolen), duration: 2, text: `💰 窃取全场2%数值！获得${Math.floor(stolen)}生命！` }
          ];
        }
      },
      skill3: {
        name: "万鞋登台",
        type: "special",
        cost: 5,
        triggerValue: 4,
        description: "对全体造成10%真实伤害，眩晕一人",
        execute(user, targets) {
          const effects = targets.map(t => ({
            type: "truedamage", target: t.id, amount: Math.floor(t.hp * 0.1),
            text: `👟 ${t.name} 被鞋砸中！10%真伤！`
          }));
          const stunTarget = targets[Math.floor(Math.random() * targets.length)];
          effects.push({ type: "stun", target: stunTarget.id, duration: 1 });
          return effects;
        }
      },
      ultimate: {
        name: "钢铁血肘",
        type: "physical",
        description: "90%眩晕，100%伤害，35%触发连续170%伤害",
        execute(user, targets) {
          const t = targets[0];
          const effects = [];
          const roll = Math.random();
          if (roll < 0.9) effects.push({ type: "stun", target: t.id, duration: roll < 0.4 ? 2 : 1 });
          const dmg = calcDamage(user, t, 1.0, "physical");
          effects.push({ type: "damage", target: t.id, amount: dmg, text: "💪 钢铁血肘！" });
          if (Math.random() < 0.35) {
            const bonus = calcDamage(user, t, 1.7, "physical");
            effects.push({ type: "damage", target: t.id, amount: bonus, text: "🔥 Ga连续！170%追加！" });
          }
          return effects;
        }
      }
    },
    passive: {
      name: "加德乐",
      description: "体力为零时下场2回合，回来体力+4",
    },
    reminisce: {
      name: "当初被绿的感受",
      description: "伤害+70%，+3体力（下一技能对队友造成5%真伤）",
      execute(user, team) {
        return [
          { type: "buff", target: user.id, stat: "damage", value: 0.7, duration: 1, text: "💚 当初被绿的感受...伤害+70%！" },
          { type: "stamina", target: user.id, amount: 3 }
        ];
      }
    }
  },

  cici: {
    id: "cici",
    name: "Cici",
    rarity: "SR",
    gender: "female",
    role: "弱化",
    emoji: "🧠",
    color: "#1ABC9C",
    description: "爱因斯坦，智力型控制角色",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "反手拳",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "70%体术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.7, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "👊 反手拳！" }];
        }
      },
      skill2: {
        name: "一万IQ攻击",
        type: "control",
        cost: 2,
        triggerValue: 3,
        description: "眩晕敌方一名并夺走一点体力",
        execute(user, targets) {
          return [
            { type: "stun", target: targets[0].id, duration: 1, text: `🧠 被一万IQ震撼！眩晕！` },
            { type: "stealStamina", from: targets[0].id, to: user.id, amount: 1 }
          ];
        }
      },
      skill3: {
        name: "西西组合技",
        type: "physical",
        cost: 4,
        triggerValue: 4,
        description: "5次打击，全命中后眩晕目标",
        execute(user, targets) {
          const t = targets[0];
          const effects = [];
          let allHit = true;
          for (let i = 0; i < 5; i++) {
            const isPunch = Math.random() < 0.6;
            const mult = isPunch ? 0.35 : 0.55;
            const dmg = calcDamage(user, t, mult, "physical");
            effects.push({ type: "damage", target: t.id, amount: dmg, text: isPunch ? `👊 拳！` : `🦵 腿！` });
          }
          if (allHit) effects.push({ type: "stun", target: t.id, duration: 1, text: "💫 全命中！眩晕！" });
          return effects;
        }
      },
      ultimate: {
        name: "式神：替身使者",
        type: "mixed",
        description: "召唤Feliz和LJ对敌方造成90%体术+90%×2法术",
        execute(user, targets) {
          const t = targets[0];
          const pdmg = calcDamage(user, t, 0.9, "physical");
          const mdmg1 = calcDamage(user, t, 0.9, "magic");
          const mdmg2 = calcDamage(user, t, 0.9, "magic");
          return [
            { type: "damage", target: t.id, amount: pdmg, text: "👊 Cici反手拳！90%体术！" },
            { type: "damage", target: t.id, amount: mdmg1, text: "✨ Feliz助攻！90%法术！" },
            { type: "damage", target: t.id, amount: mdmg2, text: "💬 LJ咒言！90%法术！" }
          ];
        }
      }
    },
    passive: { name: "爱因斯坦智慧", description: "与Feliz/LJ同队时全队伤害+10%" },
    reminisce: {
      name: "meow",
      description: "敌方所有角色伤害降低15%一回合",
      execute(user, team, enemies) {
        return enemies.map(e => ({
          type: "debuff", target: e.id, stat: "damage", value: -0.15, duration: 1,
          text: `😺 meow！${e.name} 伤害-15%！`
        }));
      }
    }
  },

  charlotte: {
    id: "charlotte",
    name: "Charlotte",
    rarity: "SR",
    gender: "female",
    role: "强化",
    emoji: "💖",
    color: "#FF69B4",
    description: "里香实锤，技能复制大师",
    maxHp: 1200,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "技能复刻",
        type: "special",
        cost: 1,
        triggerValue: 2,
        description: "复刻我方一名角色二技能（70%效果）",
        execute(user, targets, allTargets, allies) {
          return [{ type: "copySkill", source: allies[0]?.id, text: "🔄 技能复刻！70%效果！" }];
        }
      },
      skill2: {
        name: "攻击强化",
        type: "buff",
        cost: 2,
        triggerValue: 3,
        description: "一名角色下回合攻击+20%",
        execute(user, targets, allTargets, allies) {
          return [{ type: "buff", target: allies[0]?.id || user.id, stat: "damage", value: 0.2, duration: 1, text: "✨ 攻击强化+20%！" }];
        }
      },
      skill3: {
        name: "全队体力恢复",
        type: "buff",
        cost: 3,
        triggerValue: 4,
        description: "全队（除自己）恢复体力1，持续三回合",
        execute(user, targets, allTargets, allies) {
          return allies.filter(a => a.id !== user.id).map(a => ({
            type: "staminaBuff", target: a.id, amount: 1, duration: 3,
            text: `💖 ${a.name} 体力恢复！`
          }));
        }
      },
      ultimate: {
        name: "双人转",
        type: "magic",
        description: "与Zane配合，对全体造成50%伤害持续三回合",
        execute(user, targets) {
          const effects = [];
          for (let round = 0; round < 3; round++) {
            targets.forEach(t => {
              effects.push({ type: "damage", target: t.id, amount: calcDamage(user, t, 0.5, "magic"), text: `💃 双人转第${round+1}轮！` });
            });
          }
          return effects;
        }
      }
    },
    passive: {
      name: "Zane羁绊",
      description: "与Zane同队时双方+20%生命值和伤害",
    }
  },

  lj: {
    id: "lj",
    name: "LJ",
    rarity: "SR",
    gender: "female",
    role: "攻击",
    emoji: "💬",
    color: "#8E44AD",
    description: "专业咒言师，爆发型输出",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "咒言：阿hi呀",
        type: "magic",
        cost: 1,
        triggerValue: 2,
        description: "80%法术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.8, "magic");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "💬 阿hi呀！80%法术！" }];
        }
      },
      skill2: {
        name: "emo警告",
        type: "magic",
        cost: 2,
        triggerValue: 3,
        description: "提姆/尼娜/LJ各造成30-50%法术",
        execute(user, targets) {
          const t = targets[0];
          const effects = [];
          for (let i = 0; i < 3; i++) {
            const mult = 0.3 + Math.random() * 0.2;
            effects.push({ type: "damage", target: t.id, amount: calcDamage(user, t, mult, "magic"), text: `😷 咒言${i+1}！${(mult*100).toFixed(0)}%！` });
          }
          return effects;
        }
      },
      skill3: {
        name: "背叛的力量",
        type: "special",
        cost: 3,
        triggerValue: 4,
        description: "队友伤害-10%，对手被雷劈160%法术伤害",
        execute(user, targets, allTargets, allies) {
          const effects = [];
          if (allies.length > 0) {
            const victim = allies[Math.floor(Math.random() * allies.length)];
            effects.push({ type: "debuff", target: victim.id, stat: "damage", value: -0.1, duration: 1, text: `📸 发了${victim.name}的照片！` });
          }
          const dmg = calcDamage(user, targets[0], 1.6, "magic");
          effects.push({ type: "damage", target: targets[0].id, amount: dmg, text: "⚡ 天雷！160%法术！" });
          return effects;
        }
      },
      ultimate: {
        name: "咒言术：集体输出",
        type: "magic",
        description: "5个朋友各造成150-300%法术伤害",
        execute(user, targets) {
          const effects = [];
          for (let i = 0; i < 5; i++) {
            const t = targets[Math.floor(Math.random() * targets.length)];
            const mult = 1.5 + Math.random() * 1.5;
            effects.push({ type: "damage", target: t.id, amount: calcDamage(user, t, mult, "magic"), text: `💬 友人${i+1}咒言！${(mult*100).toFixed(0)}%！` });
          }
          return effects;
        }
      }
    },
    passive: { name: "Cici+Charlotte羁绊", description: "与Cici和Charlotte同队时全队+10%伤害" },
    reminisce: {
      name: "drama课角落友情",
      description: "二技能整体提升30%（触发：使用二技能两次）",
      execute(user, team) {
        return [{ type: "buff", target: user.id, stat: "skill2Boost", value: 0.3, duration: 999, text: "🎭 drama课友情！二技能+30%！" }];
      }
    }
  },

  michelle: {
    id: "michelle",
    name: "Michelle",
    rarity: "SSR",
    gender: "female",
    role: "弱化",
    emoji: "💰",
    color: "#F39C12",
    description: "富婆，控制型战略角色",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "数学天才",
        type: "control",
        cost: 2,
        triggerValue: 2,
        description: "迷惑敌方一名，下回合只能用一技能",
        execute(user, targets) {
          return [{ type: "limit", target: targets[0].id, onlySkill1: true, duration: 1, text: `🧮 ${targets[0].name} 被数学迷惑！只能用一技能！` }];
        }
      },
      skill2: {
        name: "钞能力",
        type: "control",
        cost: 3,
        triggerValue: 3,
        description: "使敌方一名叛变一回合",
        execute(user, targets) {
          return [{ type: "defect", target: targets[0].id, duration: 1, text: `💸 ${targets[0].name} 被收买叛变！` }];
        }
      },
      skill3: {
        name: "手办赠送",
        type: "buff",
        cost: 4,
        triggerValue: 4,
        description: "全队友攻击+15%，体力+1/回合，持续2回合",
        execute(user, targets, allTargets, allies) {
          return allies.map(a => ({
            type: "buff", target: a.id, stat: "damage", value: 0.15, duration: 2,
            text: `🎁 ${a.name} 获得手办！攻击+15%！`
          }));
        }
      },
      ultimate: {
        name: "领域展开：usogui是全世界最好看的漫画",
        type: "special",
        description: "老虎机赌博！40%/40%/20%不同结果",
        execute(user, targets) {
          const roll = Math.random();
          if (roll < 0.4) {
            return targets.map(t => ({
              type: "damage", target: t.id, amount: calcDamage(user, t, 1.5, "magic"),
              text: `🎰 没有相同！${t.name} 受到150%法术+眩晕！`
            })).concat(targets.map(t => ({ type: "stun", target: t.id, duration: 1 })));
          } else if (roll < 0.8) {
            const effects = [];
            for (let i = 0; i < 5; i++) {
              const t = targets[Math.floor(Math.random() * targets.length)];
              const mult = Math.random() < 0.5 ? 0.3 : 0.5;
              effects.push({ type: "damage", target: t.id, amount: calcDamage(user, t, mult, "magic"), text: `🎲 魔方投掷${i+1}！${mult*100}%！` });
            }
            return effects;
          } else {
            return targets.map(t => ({
              type: "damage", target: t.id, amount: calcDamage(user, t, 4.0, "magic"),
              text: `💥 JACKPOT！核爆400%AOE！`
            }));
          }
        }
      }
    },
    passive: { name: "富婆气场", description: "控制技能命中率+10%" }
  },

  trex: {
    id: "trex",
    name: "Trex",
    rarity: "SR",
    gender: "male",
    role: "弱化",
    emoji: "🔑",
    color: "#27AE60",
    description: "商业鬼才，钥匙扣战士",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "钥匙扣攻击",
        type: "magic",
        cost: 1,
        triggerValue: 2,
        description: "85%法术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.85, "magic");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "🔑 钥匙扣飞出！" }];
        }
      },
      skill2: {
        name: "魔戒控制",
        type: "magic",
        cost: 2,
        triggerValue: 3,
        description: "三个钥匙扣各40%，夺走敌方全体1点触发值",
        execute(user, targets) {
          const effects = [];
          for (let i = 0; i < 3; i++) {
            effects.push({ type: "damage", target: targets[0].id, amount: calcDamage(user, targets[0], 0.4, "magic"), text: `🔑 钥匙扣${i+1}！` });
          }
          targets.forEach(t => effects.push({ type: "reduceTrigger", target: t.id, amount: 1 }));
          return effects;
        }
      },
      skill3: {
        name: "中间商赚差价",
        type: "special",
        cost: 3,
        triggerValue: 4,
        description: "夺走体力最多的敌方3点体力，己方最少成员+1",
        execute(user, targets, allTargets, allies) {
          const richEnemy = [...targets].sort((a, b) => b.stamina - a.stamina)[0];
          const poorAlly = [...allies].sort((a, b) => a.stamina - b.stamina)[0];
          return [
            { type: "stealStamina", from: richEnemy?.id, to: user.id, amount: 1, text: `💰 中间商赚差价！` },
            { type: "stamina", target: poorAlly?.id, amount: 1 }
          ];
        }
      },
      ultimate: {
        name: "Keychain Rain",
        type: "magic",
        description: "持续三回合，每回合7-10个钥匙扣各10%法术伤害",
        execute(user, targets) {
          const effects = [];
          for (let round = 0; round < 3; round++) {
            const count = 7 + Math.floor(Math.random() * 4);
            targets.forEach(t => {
              for (let k = 0; k < count; k++) {
                effects.push({ type: "damage", target: t.id, amount: calcDamage(user, t, 0.1, "magic") });
              }
              effects.push({ type: "text", text: `🌧️ 第${round+1}轮！${count}个钥匙扣雨！` });
            });
          }
          return effects;
        }
      }
    },
    passive: { name: "商业眼光", description: "每回合被动积累钥匙扣收益" },
    reminisce: {
      name: "300铢三个钥匙扣",
      description: "法术伤害+25%两回合，生命恢复20%",
      execute(user, team) {
        return [
          { type: "buff", target: user.id, stat: "magicDamage", value: 0.25, duration: 2, text: "🔑 300铢三个钥匙扣！法术+25%！" },
          { type: "heal", target: user.id, amount: Math.floor(user.maxHp * 0.2) }
        ];
      }
    }
  },

  madame: {
    id: "madame",
    name: "Madame",
    rarity: "SSSR",
    gender: "female",
    role: "攻击/弱化",
    emoji: "🥐",
    color: "#2980B9",
    description: "法兰西之傲，薯条标记专家",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "Patate",
        type: "magic",
        cost: 1,
        triggerValue: 2,
        description: "130%法术伤害，附加薯条标记（+20%受伤，上限3层）",
        execute(user, targets) {
          const t = targets[0];
          const dmg = calcDamage(user, t, 1.3, "magic");
          return [
            { type: "damage", target: t.id, amount: dmg, text: "🥔 Patate！130%法术！" },
            { type: "mark", target: t.id, markType: "frites", stacks: 1, maxStacks: 3, bonus: 0.2, text: `🍟 ${t.name} 获得薯条标记！` }
          ];
        }
      },
      skill2: {
        name: "C'est parti mon kiki",
        type: "heal",
        cost: 2,
        triggerValue: 3,
        description: "清除全队2个减益，最低血量队友获得250护盾",
        execute(user, targets, allTargets, allies) {
          const lowestHp = allies.sort((a, b) => a.hp - b.hp)[0];
          return [
            ...allies.map(a => ({ type: "cleanse", target: a.id, count: 2, text: `✨ ${a.name} 清除减益！` })),
            { type: "shield", target: lowestHp?.id, amount: 250, text: `🥐 可颂护盾！250伤害吸收！` }
          ];
        }
      },
      skill3: {
        name: "Baguette",
        type: "mixed",
        cost: 4,
        triggerValue: 4,
        description: "全体140%体术，每层薯条标记+5%真伤，附加法抗-20%",
        execute(user, targets) {
          return targets.map(t => {
            const stacks = t.marks?.frites || 0;
            const trueDmg = Math.floor(t.hp * 0.05 * stacks);
            const dmg = calcDamage(user, t, 1.4, "physical");
            return [
              { type: "damage", target: t.id, amount: dmg, text: `🥖 Baguette！140%体术！` },
              ...(trueDmg > 0 ? [{ type: "truedamage", target: t.id, amount: trueDmg, text: `🍟 薯条标记×${stacks}追加真伤！` }] : []),
              { type: "debuff", target: t.id, stat: "magicResist", value: -0.2, duration: 2 }
            ];
          }).flat();
        }
      },
      ultimate: {
        name: "On Ecrit",
        type: "special",
        description: "书写2回合命运，敌方60%概率跳过行动+12%真伤",
        execute(user, targets) {
          return targets.map(t => ({
            type: "curse", target: t.id, skipChance: 0.6, trueDmgRatio: 0.12, duration: 2,
            text: `📖 命运书写！${t.name} 被诅咒2回合！`
          }));
        }
      }
    },
    passive: {
      name: "法兰西之傲",
      description: "与Harrison同队时伤害-5%；Zane增益敌人暴击率+15%",
    },
    reminisce: {
      name: "Le Examen",
      description: "全队伤害-50%，自身伤害+120%两回合",
      execute(user, team) {
        return [
          ...team.filter(m => m.id !== user.id).map(m => ({
            type: "debuff", target: m.id, stat: "damage", value: -0.5, duration: 2
          })),
          { type: "buff", target: user.id, stat: "damage", value: 1.2, duration: 2, text: "📝 Le Examen！自身伤害+120%！" }
        ];
      }
    }
  },

  feliz: {
    id: "feliz",
    name: "Feliz",
    rarity: "R",
    gender: "male",
    role: "强化",
    emoji: "🎬",
    color: "#95A5A6",
    description: "孤独的叛逆，YouTuber Aura守护者",
    maxHp: 1000,
    baseDamage: 100,
    maxStamina: 8,
    startStamina: 5,
    skills: {
      skill1: {
        name: "出拳",
        type: "physical",
        cost: 1,
        triggerValue: 2,
        description: "70%体术伤害",
        execute(user, targets) {
          const dmg = calcDamage(user, targets[0], 0.7, "physical");
          return [{ type: "damage", target: targets[0].id, amount: dmg, text: "👊 出拳！70%！" }];
        }
      },
      skill2: {
        name: "YouTuber Aura",
        type: "buff",
        cost: 2,
        triggerValue: 3,
        description: "一名角色受伤害降低50%一回合",
        execute(user, targets, allTargets, allies) {
          return [{ type: "buff", target: allies[0]?.id || user.id, stat: "damageReduce", value: 0.5, duration: 1, text: "📹 YouTuber Aura！伤害减50%！" }];
        }
      },
      skill3: {
        name: "Bunny Hop",
        type: "buff",
        cost: 3,
        triggerValue: 4,
        description: "全队+1体力，受伤害-10%两回合",
        execute(user, targets, allTargets, allies) {
          return allies.map(a => ({
            type: "buff", target: a.id, stat: "damageReduce", value: 0.1, duration: 2,
            text: `🐰 ${a.name} Bunny Hop！`
          })).concat(allies.map(a => ({ type: "stamina", target: a.id, amount: 1 })));
        }
      },
      ultimate: {
        name: "通灵术：召唤大黑",
        type: "magic",
        description: "对两位对手造成140%法术伤害",
        execute(user, targets) {
          return targets.slice(0, 2).map(t => ({
            type: "damage", target: t.id, amount: calcDamage(user, t, 1.4, "magic"),
            text: `🐕 大黑出击！140%法术！`
          }));
        }
      }
    },
    passive: {
      name: "孤独的叛逆",
      description: "4回合后每回合30%*1.01^(x-4)概率离场",
    }
  }
};

// ═══════════════════════════════════════
// DAMAGE CALCULATION HELPER
// ═══════════════════════════════════════
function calcDamage(user, target, multiplier, type) {
  let base = (user.baseDamage || 100) * multiplier;

  // Apply user buffs
  const buffs = user.buffs || [];
  buffs.forEach(b => {
    if (b.stat === "damage") base *= (1 + b.value);
    if (b.stat === "magicDamage" && type === "magic") base *= (1 + b.value);
    if (b.stat === "physicalDamage" && type === "physical") base *= (1 + b.value);
  });

  // Apply target debuffs
  const targetDebuffs = target.debuffs || [];
  targetDebuffs.forEach(d => {
    if (d.stat === "magicResist" && type === "magic") base *= (1 - d.value);
  });

  // Apply target marks
  if (target.marks?.frites) base *= (1 + target.marks.frites * 0.2);

  // Apply damage reduction
  const reduction = target.buffs?.find(b => b.stat === "damageReduce");
  if (reduction) base *= (1 - reduction.value);

  return Math.max(1, Math.floor(base));
}
