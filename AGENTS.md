# Agent instructions: Cafe Guf ordering system

Node.js and Express 5 app with a REST API, a MongoDB database (Mongoose) and a plain HTML frontend. It is an ordering system for a cafe: waiters create orders per table, the kitchen sees and marks them, and the owner manages the menu, receipts and revenue. The stories are the GitHub issues (Story 1 to 22) on the board Cafe Guf Kanban. Work in small steps, one issue at a time. We must be able to explain every line, so keep the code simple.

## Before you say done

1. Run `npm run check`. It must be green (tests and lint).
2. Tell us which files you changed, and if you changed anything we did not ask for.

If lint fails, fix the code. Never use `eslint-disable`. If a lint rule does not fit the task, stop and ask us. Changes to `eslint.config.js` need their own issue.

## Working method

1. Test first (TDD). Write a failing test that matches one acceptance criterion in the issue, then the code that makes it pass, then clean up.
2. Make a short plan first and wait for our OK before you change code.
3. Tests use `node:test` in the `test` folder, in the form Arrange, Act, Assert, named like `thing_scenario_expected`. Failure cases (400, 404) are tested as well as success cases.
4. The acceptance criteria in the issue are the definition of done for the story.

## Structure

CommonJS only. Server on port 3000. Each layer only knows the one below it.

1. `src/server.js` connects to the database and starts the server. `src/app.js` has `createApp()` and registers the routers. Only these two files wire things together.
2. Middleware order in `createApp`: `logger`, `express.json()`, `express.static` for `public/`, routers, `notFound`, then `errorHandler`.
3. `routers` map URLs to controller functions. `controllers` handle `req` and `res`, validate input and choose status codes. `services` have the rules. `models` are the Mongoose schemas.
4. Dependencies come in as parameters. Use `path.join(__dirname, ...)` for paths.
5. The database address comes from `MONGODB_URI`. Tests must not need a running database.

## API

1. Status codes: 200 for reads, 201 for create, 204 with no body for delete, 400 for invalid input, 404 for unknown id or route, 500 for other errors.
2. Invalid JSON gives 400. Wrong types (fx a number where text is expected) must give 400, never crash. Trim text on the server.
3. Errors are `{ "error": "..." }` with a fixed text, never `err.message` or a stack trace. Log the real error with `console.error` on the server. Error messages from the API are in English. Messages the frontend makes itself are in Danish.
4. The endpoints themselves are decided by the issues. Do not add endpoints that no issue asks for.

## Frontend

1. Plain JavaScript with `fetch`. POST needs `Content-Type: application/json` and `JSON.stringify(...)`.
2. Never call `response.json()` on DELETE, it has no body.
3. Use `createElement` and `textContent`, never `innerHTML`.
4. Check `response.ok` and show an error message.
5. Valid, semantic HTML and a clear layout (CRAP: contrast, repetition, alignment, proximity).

## Rules

1. Everything in code is in English: identifiers, comments and commit messages. The stories are in Danish, so use English words for the same things (order, table, dish, bill, receipt, waiter, kitchen).
2. async/await, never callbacks. No new packages without asking.
3. Only edit the files in the issue, on the branch for that issue. Merge `main` in before a PR. The PR says `Closes #` and the issue number.
4. If something looks wrong or there is a merge conflict, stop and tell us.
5. Every PR describes what the agent was asked, what it changed and what we checked in the diff. The reviewer writes at least one question and the author answers in their own words.
6. The README reflection answers and the report text are ours. Do not write them.