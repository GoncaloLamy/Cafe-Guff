# Teknisk beskrivelse af Café Guf

Café Guf er et bestillingssystem til en café. Tjenerne opretter bestillinger pr. bord, kan rette dem, dele regningen op og lukke den. Systemet er en Node.js server med et REST API og en enkel HTML frontend.

## Teknologi

| Del | Valg |
| --- | --- |
| Server | Node.js og Express 5, ES modules |
| Frontend | HTML, CSS og JavaScript med `fetch` |
| Data | I hukommelsen (nulstilles når serveren genstartes). MongoDB med Mongoose er planlagt i issue #49 |
| Tests | Vitest og supertest |
| API test | Postman, kan også køres med newman |
| Kvalitet | ESLint med faste grænser |
| Tredjepart | Open-Meteo (vejr og luftkvalitet) |

## Kør projektet

```bash
npm install
npm start
```

Serveren starter på port 3000. En anden port kan sættes med miljøvariablen `PORT`. Frontenden åbnes på `http://localhost:3000`, og vejrsiden på `http://localhost:3000/weather`.

```text
npm test          kører testene
npm run lint      kører ESLint
npm run check     kører begge, og skal være grøn før noget merges
```

## Mappestruktur

```text
public/                frontend (index.html, weather.html, css, js)
src/
  server.js            starter serveren med repositories
  app.js               createApp(), samler routes og middleware
  config/              port
  routes/              kobler URL'er til controllers
  controllers/         læser req, vælger statuskode, sender res
  services/            forretningsregler (pris, regning, vejr)
  repositories/        data i hukommelsen
  middleware/          logger, validering, notFound, errorHandler
  models/              pladsholdere til MongoDB
test/
  integration/         endpoint tests med supertest
docs/
  postman/             Postman collection
  technical-description.md
  ai-log.md
```

## Lag

Hvert lag kender kun laget under sig.

1. **Routes** kobler en URL og en metode til en controller funktion.
2. **Controllers** tager imod forespørgslen og vælger statuskode.
3. **Services** har reglerne: totalpris fra menuen, opdeling af regning og kald til vejr API'et.
4. **Repositories** gemmer data. I dag ligger de i hukommelsen, og de kan senere skiftes til MongoDB uden at services ændres.

Afhængigheder gives ind som parametre i `createApp({ menuRepository, orderRepository, fetch })`. Det gør, at tests kan bruge falske repositories og en falsk `fetch`, uden at serveren skal lytte på en port og uden internet.

Rækkefølgen af middleware i `createApp` er: `logger`, `express.json()`, statiske filer fra `public`, `/health`, routes, `notFound` og til sidst `errorHandler`.

## API

| Metode | URL | Beskrivelse | Statuskoder |
| --- | --- | --- | --- |
| GET | `/health` | Tjekker at serveren kører | 200 |
| GET | `/api/menu` | Hele menuen med navn, pris og allergener | 200 |
| POST | `/api/orders` | Opretter en bestilling til et bord | 201, 400, 404 |
| POST | `/api/orders/:id/send` | Sender bestillingen til køkkenet | 200, 404, 409 |
| PATCH | `/api/orders/:id` | Ændrer retter eller noter i en bestilling | 200, 400, 404, 409 |
| POST | `/api/orders/:id/close` | Markerer bestillingen som betalt | 200, 404, 409 |
| POST | `/api/orders/:id/split` | Deler regningen op i flere regninger | 201, 400, 404, 409 |
| POST | `/api/bills/:billId/close` | Markerer én regning som betalt | 200, 404, 409 |
| GET | `/api/kitchen/orders` | Køkkenets liste over sendte bestillinger, i den rækkefølge de blev sendt | 200 |
| GET | `/api/weather` | Aktuelt vejr og prognose for 7 dage | 200, 400, 500 |

Eksempel på at oprette en bestilling:

```http
POST /api/orders
{ "table": 3, "dishIds": [1, 2], "notes": ["No onions", "Extra cheese"] }
```

Svar (201):

```json
{
  "id": "1",
  "table": 3,
  "dishIds": ["1", "2"],
  "notes": ["No onions", "Extra cheese"],
  "total": 150,
  "createdAt": "2026-11-25T15:21:23.083Z",
  "paid": false
}
```

Eksempel på at dele en regning:

```http
POST /api/orders/1/split
{ "bills": [[1], [2]] }
```

Svar (201):

```json
{
  "bills": [
    { "id": "1", "table": 3, "dishIds": ["1"], "price": 65, "paid": false },
    { "id": "2", "table": 3, "dishIds": ["2"], "price": 85, "paid": false }
  ]
}
```

### Regler i API'et

1. Totalprisen beregnes på serveren ud fra menuen. Klienten kan ikke sende den selv.
2. `createdAt` sættes af serveren, og en `createdAt` fra klienten ignoreres.
3. En betalt bestilling kan ikke ændres eller lukkes igen (409).
4. En bestilling kan kun deles op én gang (409). Ved opdeling skal alle retter fra bestillingen fordeles, og hver ret kun på én regning, ellers får man 400.
5. En regning kan kun betales én gang (409).

### Fejl

Fejl returneres som `{ "error": "..." }` med en fast tekst på engelsk. Selve fejlen skrives til serverens log med `console.error`, så der aldrig sendes en stacktrace til klienten.

| Situation | Status | Tekst |
| --- | --- | --- |
| Ugyldigt input | 400 | fx `Invalid order`, `Invalid bills` |
| Ugyldig JSON | 400 | `Invalid JSON` |
| Forespørgslen er over 100 kB | 413 | `Payload too large` |
| Ukendt ret, bestilling, regning eller URL | 404 | fx `Bill not found` |
| Bestilling eller regning er allerede betalt eller delt | 409 | fx `Bill already paid` |
| Alt andet | 500 | `Internal server error` |

## Vejr (tredjepartsservice)

`GET /api/weather` kalder Open-Meteo to gange: én gang for vejr og prognose, og én gang for luftkvalitet (US AQI). Uden parametre bruges koordinaterne for København. Med `?latitude=...&longitude=...` kan et andet sted vælges, og ugyldige tal giver 400.

Svaret indeholder aktuel temperatur, vindhastighed, vindretning, regn, følt temperatur, luftfugtighed, luftkvalitet og en prognose for 7 dage med en enkel tilstand (`clear`, `rain` eller `snow`). Hvis kaldet om luftkvalitet fejler, vises vejret alligevel, og frontenden skriver "Ikke tilgængelig" ved luftkvaliteten. Fejler selve vejrkaldet, får klienten 500.

## Test

Testene ligger i `test/integration` og bruger supertest, så serveren ikke behøver køre. De er skrevet som Arrange, Act, Assert og navngivet efter mønstret `ting_scenarie_forventet`, fx `closeBill_alreadyPaidBill_returns409`. Fejltilfælde (400, 404, 409) testes sammen med det, der går godt.

Postman collectionen ligger i `docs/postman`. Den dækker de stories, der er lavet, og kan køres uden Postman, mens serveren kører i en anden terminal:

```bash
npm start                # i den første terminal
npm run postman         # i en anden terminal, mens serveren kører
```

Vejr requests kræver internet, fordi de kalder det rigtige Open-Meteo.

### Kodekvalitet

ESLint kører med disse grænser, og tests er undtaget fra dem:

1. Højst 40 linjer pr. funktion og 120 linjer pr. fil.
2. Højst 4 parametre pr. funktion.
3. Kompleksitet højst 6.
4. `var` er forbudt, og ubrugte variable giver fejl.

## Afgrænsninger i dag

1. Data forsvinder ved genstart, fordi der endnu ikke er en database (#49).
2. Der er endnu intet login. Filerne er pladsholdere markeret `TODO` (Story 18).
3. Kvitteringer er endnu ikke lavet. Filerne er pladsholdere markeret `TODO` (Story 15 og 17).
4. Menuen kan kun læses gennem API'et.