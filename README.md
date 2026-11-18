# Café Guf

Bestillingssystem til en café i det centrale København. Tjenerne opretter bestillinger pr. bord, køkkenet ser dem og markerer dem klar, og ejeren styrer menu, kvitteringer og omsætning. Lavet med Extreme Programming til eksamensprojektet på 3. semester, Zealand Næstved.

Teknologi: Node.js, Express 5, MongoDB med Mongoose, HTML og JavaScript til frontend, tests med `node:test` og Postman til API'et.

## Test

    npm test
    npm run lint
    npm run check

`npm run check` kører tests og lint og skal være grøn før en pull request.

## Mapper

    public       frontend
    src          serverkoden (routers, controllers, services, models, middleware)
    test         tests med node:test
    postman      Postman samling
    docs         teknisk beskrivelse og billeder

## Arbejdsmetode

Hver user story er et issue på boardet Café Guf Kanban. Én branch pr. issue og én pull request pr. issue, med `Closes #` og issue nummeret. Reglerne for AI agenter står i `AGENTS.md`.