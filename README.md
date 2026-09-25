<p align="center">
  <img src="assets/hero.svg" width="720" alt="AI Setup. A copper rule draws in, then RULES, SKILLS and LANGUAGES lock in as pinned.">
</p>

<p align="center">
  <a href="#english">English</a>
  &nbsp;·&nbsp;
  <a href="#català">Català</a>
</p>

# English

A shared kit for starting projects with a coding agent (Cursor, Claude Code, Codex, OpenCode, Gemini CLI, GitHub Copilot). It does not contain an application. It contains the instructions those agents read, written once so every new repo starts from the same agreement.

An agent already knows how to write code. It does not know how this team works: which files it must not touch, which languages the interface speaks, when a change counts as finished, or which third-party instructions it is allowed to install. That is what these files are for. They are short on purpose. Everything in them is loaded into the conversation, so a vague rule crowds out a useful one.

## What is in this repo

| File | Who it is for | What you do with it |
| --- | --- | --- |
| [`global-rules.md`](global-rules.md) | Each person, once | Install it in your own agent. It is not copied into projects. |
| [`AGENTS.template.md`](AGENTS.template.md) | Each new repo | Copy it to `AGENTS.md` and fill in the blanks. |
| [`examples/AGENTS.nextjs-ai.md`](examples/AGENTS.nextjs-ai.md) | Anyone writing a project file | A filled-in example: a private-beta app with Next.js, Supabase and an LLM. |
| [`prueba.md`](prueba.md) | Reference only | The first Spanish draft. The files above replace it. Do not copy it into a project. |

`global-rules.md` also tells the agent how to install skills: only from a reviewed catalog, each one pinned to a commit, and never with a bare `npx skills add` against whatever `main` contains that day. The catalog is `skills/catalog.json`, the installer is `skills/skills.mjs`, and `skills/README.md` is the guide for adding one.

## Set it up once

Paste `global-rules.md` into the user-level rules of the agent you actually use:

| Agent | Where |
| --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/AGENTS.md` |
| OpenCode | `~/.config/opencode/AGENTS.md` |
| Gemini CLI | `~/.gemini/GEMINI.md` |
| Cursor | Settings → Rules → User Rules |
| GitHub Copilot | `~/.copilot/copilot-instructions.md`, or the repo's `.github/copilot-instructions.md` |

If a project's `AGENTS.md` disagrees with your global rules, the project file wins.

## Start a project

1. Copy `AGENTS.template.md` to `AGENTS.md` in the new repo.
2. Replace every `<...>` and delete the lines that do not apply. The useful parts are the ones an agent cannot guess: how to install and run the app, when a change is done, the repo map, and the files it must ask about before editing.
3. Fill in **Languages**. Code is always English (that rule is global). This section is where the team decides the documentation languages and the interface languages, including how the language switcher behaves.
4. Point Claude Code at the same file, so there is a single source. From the repo root:

   ```bash
   ln -s AGENTS.md CLAUDE.md
   ```

5. Commit `AGENTS.md`. When the agent keeps making the same mistake, add one line under **Known pitfalls**. That section is the memory of the repo.

Keep the file under about 100 lines. If a rule would be true in every repository, it belongs in `global-rules.md`, not here.

## Languages

Three different things, three different rules:

- **The reply.** The agent answers in the language of the message it just received. The language of these files does not count, and neither does the language of the code. If you write in Catalan, you get Catalan back. If a teammate writes in English in the same repo, they get English.
- **The code.** Identifiers, filenames, branches, comments, commits and internal errors are English, whoever is talking.
- **Docs and UI.** Only the languages listed in that project's `AGENTS.md`. The agent does not add or drop a language on its own, and it does not write interface copy straight into the components: it goes through the project's i18n system, in every active language.

For a multilingual interface the global rules also fix the details that usually break: the switcher shows each language under its own name and without flags, switching stays on the same page, an explicit choice beats browser detection, and dates, numbers and plurals follow the active language.

## Read the example before writing your own

[`examples/AGENTS.nextjs-ai.md`](examples/AGENTS.nextjs-ai.md) is the template filled in for a fictional product, Actas. Steal the level of detail, not the stack. The part worth copying even when your stack is different is **Known pitfalls**: generated files you must not edit by hand, a test command that spends money, and the router import that keeps the language switcher on the same page.

---

# Català

Un kit compartit per arrencar projectes amb un agent de codi (Cursor, Claude Code, Codex, OpenCode, Gemini CLI, GitHub Copilot). No hi ha cap aplicació. Hi ha les instruccions que aquests agents llegeixen, escrites una sola vegada perquè cada repo nou parteixi del mateix acord.

Un agent ja sap escriure codi. No sap com treballa aquest equip: quins fitxers no ha de tocar, en quines llengües parla la interfície, quan un canvi es considera acabat, ni quines instruccions de tercers pot instal·lar. Per a això serveixen aquests fitxers. Són curts a propòsit. Tot el que hi ha dins es carrega a la conversa, així que una regla vaga treu lloc a una d'útil.

## Què hi ha al repo

| Fitxer | Per a qui | Què en fas |
| --- | --- | --- |
| [`global-rules.md`](global-rules.md) | Cada persona, un sol cop | Instal·la'l al teu agent. No es copia als projectes. |
| [`AGENTS.template.md`](AGENTS.template.md) | Cada repo nou | Copia'l a `AGENTS.md` i omple els buits. |
| [`examples/AGENTS.nextjs-ai.md`](examples/AGENTS.nextjs-ai.md) | Qui escrigui el fitxer del projecte | Un exemple omplert: una app en beta privada amb Next.js, Supabase i un LLM. |
| [`prueba.md`](prueba.md) | Només de referència | El primer esborrany, en castellà. Els fitxers de dalt el substitueixen. No el copiïs a un projecte. |

`global-rules.md` també diu a l'agent com instal·lar skills: només des d'un catàleg revisat, cadascuna fixada a un commit, i mai amb un `npx skills add` pelat contra el que hi hagi aquell dia a `main`. El catàleg és `skills/catalog.json`, l'instal·lador és `skills/skills.mjs`, i `skills/README.md` és la guia per afegir-ne una.

## Configura-ho un cop

Enganxa `global-rules.md` a les regles d'usuari de l'agent que facis servir:

| Agent | On |
| --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/AGENTS.md` |
| OpenCode | `~/.config/opencode/AGENTS.md` |
| Gemini CLI | `~/.gemini/GEMINI.md` |
| Cursor | Settings → Rules → User Rules |
| GitHub Copilot | `~/.copilot/copilot-instructions.md`, o `.github/copilot-instructions.md` del repo |

Si l'`AGENTS.md` d'un projecte contradiu les teves regles globals, mana el fitxer del projecte.

## Obre un projecte

1. Copia `AGENTS.template.md` a `AGENTS.md` dins del repo nou.
2. Substitueix cada `<...>` i esborra les línies que no s'apliquin. Les parts útils són les que un agent no pot endevinar: com s'instal·la i s'engega l'app, quan un canvi està fet, el mapa del repo i els fitxers que ha de preguntar abans de tocar.
3. Omple **Languages**. El codi va sempre en anglès (això és una regla global). Aquesta secció és on l'equip decideix les llengües de la documentació i les de la interfície, inclòs el comportament del selector d'idioma.
4. Fes que Claude Code llegeixi el mateix fitxer, perquè només n'hi hagi una font. Des de l'arrel del repo:

   ```bash
   ln -s AGENTS.md CLAUDE.md
   ```

5. Fes commit d'`AGENTS.md`. Quan l'agent repeteixi el mateix error, afegeix una línia a **Known pitfalls**. Aquesta secció és la memòria del repo.

Mantén el fitxer per sota d'unes 100 línies. Si una regla valdria per a tots els repositoris, va a `global-rules.md`, no aquí.

## Llengües

Tres coses diferents, tres regles diferents:

- **La resposta.** L'agent contesta en la llengua del missatge que acaba de rebre. No compta la llengua d'aquests fitxers, ni la del codi. Si escrius en català, et respon en català. Si un company escriu en anglès al mateix repo, a ell li respon en anglès.
- **El codi.** Identificadors, noms de fitxer, branques, comentaris, commits i errors interns van en anglès, parli qui parli.
- **Documentació i interfície.** Només les llengües que indiqui l'`AGENTS.md` d'aquell projecte. L'agent no afegeix ni treu cap llengua pel seu compte, i no escriu els textos de la interfície directament als components: passen pel sistema d'i18n del projecte, en totes les llengües actives.

En una interfície multilingüe, les regles globals també fixen els detalls que solen fallar: el selector mostra cada llengua amb el seu nom i sense banderes, en canviar et quedes a la mateixa pàgina, una elecció explícita guanya a la detecció del navegador, i les dates, els números i els plurals segueixen la llengua activa.

## Llegeix l'exemple abans d'escriure el teu

[`examples/AGENTS.nextjs-ai.md`](examples/AGENTS.nextjs-ai.md) és la plantilla omplerta per a un producte de ficció, Actas. Copia el nivell de detall, no l'stack. La part que val la pena copiar encara que el teu stack sigui un altre és **Known pitfalls**: fitxers generats que no s'editen a mà, una ordre de test que costa diners, i l'import del router que manté el selector d'idioma a la mateixa pàgina.
