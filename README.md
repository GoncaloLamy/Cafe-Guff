# Café Guf

Bestillingssystem til en café i det centrale København. Tjenerne opretter bestillinger pr. bord, køkkenet ser dem og markerer dem klar, og ejeren styrer menu, kvitteringer og omsætning. Lavet med Extreme Programming til eksamensprojektet på 3. semester, Zealand Næstved.

Teknologi: Node.js, Express 5, HTML og JavaScript til frontend, tests med Vitest og supertest og Postman til API'et. Data ligger i hukommelsen indtil MongoDB med Mongoose kommer i #49.

## Kør

    npm install
    npm start

Serveren kører på http://localhost:3000. Se `docs/technical-description.md` for API'et.

## Test

    npm test
    npm run lint
    npm run check

`npm run check` kører tests og lint og skal være grøn før en pull request.

## Mapper

    public       frontend
    src          serverkoden (routes, controllers, services, repositories, middleware)
    test         tests med Vitest og supertest
    docs         teknisk beskrivelse, Postman samling og AI log

## Arbejdsmetode

Hver user story er et issue på boardet Café Guf Kanban. Én branch pr. issue og én pull request pr. issue, med `Closes #` og issue nummeret. Reglerne for AI agenter står i `AGENTS.md`.