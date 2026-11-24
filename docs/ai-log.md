<!-- TODO: prompts, answers and our assessment of the agents -->
## 24/11 Read only kodereview af main

**Prompt:** Review the code in src for architecture problems, security problems and missing error handling. Do not change any file. For each finding, give the file, what goes wrong, a request that shows it, and a suggested fix. Also list which acceptance criteria and status codes have no test. Follow AGENTS.md.

**Hvad agenten gjorde:** Læste koden og issues uden at ændre filer. Den kunne ikke køre kode eller tests.

**Vurdering af fund:**
- Rettes i hardening issue: errorHandler (413 bliver 500), manglende tests for 404, ugyldig JSON, health og 500, fejltests for Story 2.
- Afklares med kunden: dubletter i dishIds, om create også skal returnere total.
- Afvist: manglende MongoDB (bevidst KISS valg), TODO routes og models (kommende stories), try/catch i controllers (Express 5 videresender fejl, ville være overengineering).
- Senere: auth middleware (Story 18).

**Kritisk vurdering:** Agenten behandlede ikke implementerede stories og kommende stories forskelligt, så over halvdelen af fundene var støj. Eksemplerne på requests er ikke afprøvet. Agenten fandt ikke de fund, vi selv fandt med en probe (413, grænser på table og dishIds, X-Powered-By).

## 24/11 Postman collection lavet med Postman AI

**Prompt:** Create a Postman collection named "Cafe Guf API" for a REST API running at http://localhost:3000 ... exactly these folders and requests, no others ... Tests script checks status code and fields ... (hele prompten ligger i bilag).

**Resultat:** 5 mapper og 19 requests (Story 2 og 12, 11, 14, 20, 13). Alle 38 tests grønne i Collection Runner mod serveren.

**Vurdering:** Vi tjekkede mapper, requests og statuskoder mod vores liste. Postman AI skrev i sin opsummering 18 requests, men der er 19, så opsummeringen var forkert, ikke samlingen. Fejl requests tjekker kun, at der er et error felt, ikke teksten.