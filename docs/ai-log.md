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