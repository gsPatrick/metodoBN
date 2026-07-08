"use client";

import { useEffect, useState } from "react";
import styles from "./PlanoView.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import MacroSummary from "@/components/molecules/MacroSummary/MacroSummary";

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function FoodRow({ food, onRecipe, findRecipe }) {
  const [open, setOpen] = useState(false);
  const hasSubs = food.subs && food.subs.length > 0;
  const recipe = findRecipe(food.name);
  return (
    <div className={styles.food}>
      <div className={styles.foodMain}>
        <span className={styles.foodDot} />
        <span className={styles.foodText}>
          <span className={styles.foodName}>
            {food.name}
            {recipe && (
              <button type="button" className={styles.recipeTag} onClick={() => onRecipe(recipe)}>
                <Icon name="utensils" size={12} /> receita
              </button>
            )}
          </span>
          <span className={styles.foodQty}>{food.qty}</span>
        </span>
        {hasSubs && (
          <button type="button" className={`${styles.subBtn} ${open ? styles.subBtnOpen : ""}`} onClick={() => setOpen((o) => !o)}>
            <Icon name="swap" size={15} />
            {open ? "Ocultar" : `${food.subs.length} trocas`}
          </button>
        )}
      </div>
      {open && hasSubs && (
        <ul className={styles.subs}>
          {food.subs.map((s, i) => {
            const r = findRecipe(s.split("—")[0]);
            return (
              <li key={i} className={styles.subItem}>
                <Icon name="chevronRight" size={13} />
                <span className={styles.subText}>{s}</span>
                {r && (
                  <button type="button" className={styles.subRecipe} onClick={() => onRecipe(r)}>
                    <Icon name="utensils" size={11} /> receita
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MealCard({ meal, onRecipe, findRecipe }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.meal}>
      <button type="button" className={styles.mealHead} onClick={() => setOpen((o) => !o)}>
        <span className={styles.mealTime}>{meal.time}</span>
        <span className={styles.mealName}>{meal.name}</span>
        <span className={styles.mealKcal}>
          <Icon name="flame" size={14} /> {meal.kcal} kcal
        </span>
        <Icon name="chevronRight" size={18} className={`${styles.mealChev} ${open ? styles.mealChevOpen : ""}`} />
      </button>
      {open ? (
        <>
          <div className={styles.foods}>
            {meal.foods.map((f, i) => (
              <FoodRow key={i} food={f} onRecipe={onRecipe} findRecipe={findRecipe} />
            ))}
          </div>
          <div className={styles.mealMacros}>
            <span className={styles.mm}>
              <b className={styles.mmC}>C</b> {meal.macros.c}g
            </span>
            <span className={styles.mm}>
              <b className={styles.mmP}>P</b> {meal.macros.p}g
            </span>
            <span className={styles.mm}>
              <b className={styles.mmL}>G</b> {meal.macros.l}g
            </span>
          </div>
        </>
      ) : (
        <div className={styles.mealCollapsed}>{meal.foods.length} itens · toque para abrir</div>
      )}
    </div>
  );
}

// Aceita lista (mock) ou texto único (importado). Quebra passos numerados "1. ... 2. ...".
function splitNumbered(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    const parts = v.split(/\s*\d+\s*[.)]\s+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
  }
  return null;
}

function RecipeModal({ recipe, onClose }) {
  const ingArr = Array.isArray(recipe.ingredients) ? recipe.ingredients : null;
  const stepArr = splitNumbered(recipe.steps);
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fechar">
          <Icon name="close" size={18} />
        </button>
        <span className={styles.modalKicker}>
          <Icon name="utensils" size={14} /> Receita
        </span>
        <h3 className={styles.modalTitle}>{recipe.name}</h3>
        {recipe.yield && <span className={styles.modalYield}>Rendimento: {recipe.yield}</span>}
        <span className={styles.recipeLabel}>Ingredientes</span>
        {ingArr ? (
          <ul className={styles.recipeIng}>
            {ingArr.map((ing, j) => (
              <li key={j}>{ing}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.recipeText}>{recipe.ingredients || "—"}</p>
        )}
        <span className={styles.recipeLabel}>Modo de preparo</span>
        {stepArr ? (
          <ol className={styles.recipeSteps}>
            {stepArr.map((st, j) => (
              <li key={j}>{st}</li>
            ))}
          </ol>
        ) : (
          <p className={styles.recipeText}>{recipe.steps || "—"}</p>
        )}
      </div>
    </div>
  );
}

function tone(a) {
  return a >= 95 ? "full" : a >= 80 ? "mid" : "low";
}

function DiaryView({ diary }) {
  const todayIndex = 3; // Qui 26/06 (hoje no exemplo)
  const [day, setDay] = useState(todayIndex);

  if (!diary || !diary.length) {
    return (
      <div className={styles.emptyTab}>
        <span className={styles.emptyTabIcon}>
          <Icon name="calendar" size={28} />
        </span>
        <span className={styles.emptyTabTitle}>Diário ainda vazio</span>
        <span className={styles.emptyTabText}>Quando o paciente registrar refeições e trocas no app, o acompanhamento aparece aqui.</span>
      </div>
    );
  }

  const d = diary[Math.min(day, diary.length - 1)];
  const swaps = diary.reduce((n, x) => n + x.events.filter((e) => e.to).length, 0);
  const skips = diary.reduce((n, x) => n + x.events.filter((e) => e.skip).length, 0);
  const avg = Math.round(diary.reduce((n, x) => n + x.adesao, 0) / diary.length);

  return (
    <div className={styles.diary}>
      <div className={styles.diarySummary}>
        <div className={styles.diaryStat}>
          <span className={styles.diaryStatNum}>{avg}%</span>
          <span className={styles.diaryStatLabel}>adesão média</span>
        </div>
        <div className={styles.diaryStat}>
          <span className={styles.diaryStatNum}>{swaps}</span>
          <span className={styles.diaryStatLabel}>trocas na semana</span>
        </div>
        <div className={styles.diaryStat}>
          <span className={styles.diaryStatNum}>{skips}</span>
          <span className={styles.diaryStatLabel}>não comeu</span>
        </div>
      </div>

      <div className={styles.weekbar}>
        {diary.map((x, i) => (
          <button key={i} type="button" className={`${styles.dayChip} ${i === day ? styles.dayChipActive : ""}`} onClick={() => setDay(i)}>
            <span className={styles.dayName}>{x.label}</span>
            <span className={styles.dayDate}>{x.date}</span>
            <span className={`${styles.dayDot} ${styles[`dot_${tone(x.adesao)}`]}`} />
            {i === todayIndex && <span className={styles.todayTag}>hoje</span>}
          </button>
        ))}
      </div>

      <div className={styles.dayCard}>
        <div className={styles.dayCardHead}>
          <span className={styles.dayCardTitle}>
            {d.label}, {d.date}
          </span>
          <span className={`${styles.dayAdesao} ${styles[`adh_${tone(d.adesao)}`]}`}>Adesão {d.adesao}%</span>
        </div>
        {d.events.length === 0 ? (
          <div className={styles.dayEmpty}>
            <Icon name="check" size={18} /> Seguiu o plano à risca o dia todo.
          </div>
        ) : (
          <ul className={styles.events}>
            {d.events.map((e, i) => (
              <li key={i} className={styles.event}>
                <span className={`${styles.eventIcon} ${e.skip ? styles.eventSkip : styles.eventSwap}`}>
                  <Icon name={e.skip ? "close" : "swap"} size={15} />
                </span>
                <span className={styles.eventText}>
                  <span className={styles.eventMeal}>{e.meal}</span>
                  {e.skip ? (
                    <span className={styles.eventDesc}>
                      Não comeu <b>{e.food}</b>
                    </span>
                  ) : (
                    <span className={styles.eventDesc}>
                      Trocou <b>{e.food}</b> → <b className={styles.eventTo}>{e.to}</b>
                    </span>
                  )}
                </span>
                <span className={styles.eventTime}>{e.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const SUBTABS = [
  { key: "refeicoes", label: "Refeições", icon: "utensils" },
  { key: "diario", label: "Diário", icon: "calendar" },
  { key: "lista", label: "Lista de compras", icon: "cart" },
  { key: "receitas", label: "Receitas", icon: "clipboard" }
];

export default function PlanoView({ plan, patientId, tabs = null, consumed = null }) {
  const { totals, meals, shopping, recipes, prescritoEm, diary, purchases } = plan;
  const allowed = SUBTABS.filter((s) => !tabs || tabs.includes(s.key));
  const [sub, setSub] = useState(allowed[0].key);
  const [recipe, setRecipe] = useState(null);
  const [bought, setBought] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`bn_compras_${patientId}`);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.bought) {
          setBought(d.bought);
          return;
        }
      }
    } catch {
      /* ignora */
    }
    setBought([]); // sem marcações: a nutri vê a lista completa (o paciente marca no app dele)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function findRecipe(name) {
    const n = norm(name);
    if (!n) return null;
    return recipes.find((r) => n === norm(r.name) || n.startsWith(norm(r.name)) || norm(r.name).startsWith(n)) || null;
  }

  // item da lista pode ser string (mock) ou objeto { name, subs } (plano importado)
  const itemName = (it) => (typeof it === "string" ? it : it.name);
  const itemSubs = (it) => (typeof it === "string" ? [] : it.subs || []);

  const allItems = shopping.flatMap((g) => g.items.map(itemName));
  const totalItems = allItems.length;
  const boughtCount = allItems.filter((it) => bought.includes(it)).length;
  const buyPct = totalItems ? Math.round((boughtCount / totalItems) * 100) : 0;
  const totalExtras = purchases.reduce((n, t) => n + t.extras.length, 0);

  return (
    <div className={styles.plano}>
      {/* Resumo do dia */}
      <MacroSummary totals={totals} consumed={consumed} />

      {/* Sub-abas */}
      <div className={styles.subtabs}>
        {allowed.map((s) => (
          <button key={s.key} type="button" className={`${styles.subtab} ${sub === s.key ? styles.subtabActive : ""}`} onClick={() => setSub(s.key)}>
            <Icon name={s.icon} size={16} /> {s.label}
          </button>
        ))}
      </div>

      {sub === "refeicoes" && (
        <div className={styles.meals}>
          {meals.map((m) => (
            <MealCard key={m.time} meal={m} onRecipe={setRecipe} findRecipe={findRecipe} />
          ))}
        </div>
      )}

      {sub === "diario" && <DiaryView diary={diary} />}

      {sub === "lista" && (
        <div className={styles.lista}>
          {totalItems > 0 ? (
            <>
              <div className={styles.listaHead}>
                <span className={styles.listaProgressText}>
                  <Icon name="cart" size={16} /> {boughtCount} de {totalItems} itens comprados
                </span>
                <div className={styles.listaBar}>
                  <span className={styles.listaBarFill} style={{ "--w": `${buyPct}%` }} />
                </div>
              </div>

              <div className={styles.shopGroups}>
                {shopping.map((g) => {
                  const gb = g.items.filter((it) => bought.includes(itemName(it))).length;
                  return (
                    <div key={g.group} className={styles.shopGroup}>
                      <h4 className={styles.shopGroupTitle}>
                        <Icon name={g.icon} size={16} /> {g.group}
                        <span className={styles.shopCount}>
                          {gb}/{g.items.length}
                        </span>
                      </h4>
                      <div className={styles.shopping}>
                        {g.items.map((it) => {
                          const name = itemName(it);
                          const subs = itemSubs(it);
                          const done = bought.includes(name);
                          return (
                            <div key={name} className={`${styles.shopItem} ${done ? styles.shopItemDone : ""}`}>
                              <span className={styles.shopCheck}>{done && <Icon name="check" size={12} strokeWidth={3} />}</span>
                              <span className={styles.shopItemBody}>
                                <span className={styles.shopItemName}>{name}</span>
                                {subs.length > 0 && (
                                  <span className={styles.shopSubs}>
                                    <Icon name="swap" size={11} /> ou: {subs.join(" · ")}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.emptyTab}>
              <span className={styles.emptyTabIcon}>
                <Icon name="cart" size={28} />
              </span>
              <span className={styles.emptyTabTitle}>Sem lista de compras</span>
              <span className={styles.emptyTabText}>A lista de compras vem junto com o plano alimentar importado.</span>
            </div>
          )}

          {purchases.length > 0 && (
            <>
              <div className={styles.divider}>
                <span className={styles.dividerLabel}>
                  <Icon name="calendar" size={14} /> Histórico de compras
                </span>
              </div>

              {/* histórico de compras (datas) */}
              <div className={styles.compCard}>
            <div className={styles.compSummary}>
              <div className={styles.compStat}>
                <span className={styles.compStatNum}>{purchases.length}</span>
                <span className={styles.compStatLabel}>idas ao mercado</span>
              </div>
              <div className={styles.compStat}>
                <span className={styles.compStatNum}>{purchases[purchases.length - 1].date}</span>
                <span className={styles.compStatLabel}>última compra</span>
              </div>
              <div className={styles.compStat}>
                <span className={styles.compStatNum}>{totalExtras}</span>
                <span className={styles.compStatLabel}>itens a mais</span>
              </div>
            </div>
            <ul className={styles.trips}>
              {purchases.map((t, i) => (
                <li key={i} className={styles.trip}>
                  <span className={styles.tripDot}>
                    <Icon name="cart" size={15} />
                  </span>
                  <span className={styles.tripBody}>
                    <span className={styles.tripDate}>
                      {t.day}, {t.date}
                    </span>
                    <span className={styles.tripInfo}>
                      {t.items} itens da lista{t.extras.length > 0 ? ` · ${t.extras.length} a mais` : ""}
                    </span>
                    {t.extras.length > 0 && (
                      <span className={styles.tripExtras}>
                        {t.extras.map((e, j) => (
                          <span key={j} className={styles.extraChip}>+ {e}</span>
                        ))}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
            </>
          )}
        </div>
      )}

      {sub === "receitas" && (
        <div className={styles.recipeCards}>
          {recipes.map((r, i) => (
            <button key={i} type="button" className={styles.recipeCard} onClick={() => setRecipe(r)}>
              <span className={styles.recipeCardIcon}>
                <Icon name="utensils" size={20} />
              </span>
              <span className={styles.recipeCardText}>
                <span className={styles.recipeCardName}>{r.name}</span>
                <span className={styles.recipeCardYield}>
                  {r.yield || "Receita"}
                  {Array.isArray(r.ingredients) ? ` · ${r.ingredients.length} ingredientes` : ""}
                </span>
              </span>
              <Icon name="chevronRight" size={18} />
            </button>
          ))}
        </div>
      )}

      <p className={styles.foot}>Prescrito em {prescritoEm}</p>

      {recipe && <RecipeModal recipe={recipe} onClose={() => setRecipe(null)} />}
    </div>
  );
}
