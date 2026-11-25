# Café Guf

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)
![Postman](https://img.shields.io/badge/API-Postman-FF6C37?logo=postman&logoColor=white)
![Check](https://github.com/GoncaloLamy/Cafe-Guff/actions/workflows/check.yml/badge.svg)

Bestillingssystem til en café i det centrale København. Tjenerne opretter bestillinger pr. bord, retter dem, deler regningen op og lukker den. Systemet er lavet med Extreme Programming (XP) som eksamensprojekt på 3. semester, Datamatiker, Zealand Næstved.

## Hvad kan systemet i dag

| Funktion | Beskrivelse |
| --- | --- |
| Menu | Hele menuen med pris og allergener |
| Bestilling | Opret en bestilling til et bord, med noter pr. ret og tidsstempel |
| Ret bestilling | Tilføj eller fjern retter og ret noter, så længe den ikke er betalt |
| Samlet pris | Totalprisen regnes på serveren ud fra menuen |
| Betaling | Luk en bestilling som betalt |
| Del regningen | Del en bestilling op i flere regninger, og betal dem hver for sig |
| Vejr | Aktuelt vejr og 7 dages prognose fra Open-Meteo, vist på en vejrside |
| Sikring af API'et | Tydelige fejlsvar, grænse på forespørgslens størrelse og et health check |

Endnu ikke lavet: kvitteringer, login og menustyring for ejeren, og en rigtig database (MongoDB med Mongoose, issue #49). Data ligger i hukommelsen og forsvinder, når serveren genstartes.

## Kom i gang

Du skal have en nyere Node.js (projektet er udviklet med Node 24).

```bash
git clone https://github.com/GoncaloLamy/Cafe-Guff.git
cd Cafe-Guff
npm install
npm start
```

Åbn derefter `http://localhost:3000`. Vejrsiden ligger på `http://localhost:3000/weather`. En anden port kan sættes med miljøvariablen `PORT`.

## Test

```bash
npm test          # Vitest og supertest, kører uden at starte serveren
npm run lint      # ESLint
npm run check     # begge dele, skal være grøn før noget merges
```

API'et kan også testes med Postman. Samlingen ligger i `docs/postman`. Start serveren med `npm start` i én terminal, og kør samlingen i en anden:

```bash
npm run postman
```

## API i overblik

| Metode | URL | Hvad den gør |
| --- | --- | --- |
| GET | `/health` | Tjekker at serveren kører |
| GET | `/api/menu` | Hele menuen |
| POST | `/api/orders` | Opretter en bestilling |
| PATCH | `/api/orders/:id` | Ændrer retter eller noter |
| POST | `/api/orders/:id/close` | Markerer bestillingen som betalt |
| POST | `/api/orders/:id/split` | Deler regningen op |
| POST | `/api/bills/:billId/close` | Markerer én regning som betalt |
| GET | `/api/weather` | Aktuelt vejr og prognose |

Statuskoder, eksempler på request og svar og reglerne bag står i [teknisk beskrivelse](docs/technical-description.md).

## Sådan er koden bygget

```text
public/        frontend (HTML, CSS og JavaScript med fetch)
src/
  routes/        kobler URL'er til controllers
  controllers/   læser forespørgslen og vælger statuskode
  services/      forretningsregler (pris, regning, vejr)
  repositories/  data (i hukommelsen indtil MongoDB)
  middleware/    logger, validering, fejlhåndtering
test/          tests med Vitest og supertest
docs/          teknisk beskrivelse, Postman samling og AI log
```

Hvert lag kender kun laget under sig. Afhængigheder gives ind som parametre i `createApp()`, så tests kan bruge falske repositories og en falsk `fetch`, uden database og uden internet.

## Arbejdsmetode

Vi arbejder i ugentlige cyklusser med XP.

1. Hver user story er et issue på boardet Café Guf Kanban.
2. Test først (TDD): en rød test, der passer til et acceptkriterium, og så koden der gør den grøn.
3. Én branch og én pull request pr. issue, med `Closes #` og issue nummeret.
4. Parprogrammering, og `Co-authored-by` i commits, når vi har arbejdet sammen.
5. `npm run check` skal være grøn før en pull request.
6. Hver pull request skriver, hvad AI agenten blev bedt om, hvad den ændrede, og hvad vi selv har tjekket. Reviewer skriver mindst ét spørgsmål, og forfatteren svarer med egne ord.

Reglerne for AI agenter står i [AGENTS.md](AGENTS.md), og vores prompts og vurdering af agenterne står i [docs/ai-log.md](docs/ai-log.md).

## Hvor finder jeg hvad

| Jeg vil se | Gå hen her |
| --- | --- |
| Hvad der er planlagt og lavet | Boardet Café Guf Kanban og issues |
| Hvordan koden hænger sammen | [docs/technical-description.md](docs/technical-description.md) |
| API'et i praksis | [docs/postman](docs/postman) |
| Hvordan vi bruger AI | [AGENTS.md](AGENTS.md) og [docs/ai-log.md](docs/ai-log.md) |
| Hvordan vi arbejder sammen | Pull requests, med review og svar |

## Gruppen

| Navn | GitHub |
| --- | --- |
| Nicki | Rheedocs |
| Goncalo | GoncaloLamy |
| Mattias | MatthFPS |
| Jannik | jannikwk |
| Nicklas | nicky4gun |